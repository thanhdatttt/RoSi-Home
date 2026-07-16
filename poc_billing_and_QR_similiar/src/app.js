import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import { SignJWT, jwtVerify } from 'jose';
import { and, desc, eq, lt } from 'drizzle-orm';
import { createDatabase, DEMO, seedDemo } from './database.js';
import {
  billingRunSkips,
  invoiceStatusHistory,
  invoices,
  landlordPaymentSettings,
  leases,
  meterReadingCorrections,
  meterReadings,
  notificationEvents,
  paymentProofs,
  payments,
  properties,
  rooms,
  users,
} from './schema.js';
import { generateVietQrPayload, toQrDataUrl } from './vietqr.js';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png']);
const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const httpError = (status, message) => Object.assign(new Error(message), { status });

function jwtKey(secret) {
  return new TextEncoder().encode(secret);
}

function validateReadings(electricity, water) {
  if (!Number.isSafeInteger(electricity) || electricity < 0) {
    throw httpError(400, 'Electricity reading must be a non-negative integer');
  }
  if (!Number.isSafeInteger(water) || water < 0) {
    throw httpError(400, 'Water reading must be a non-negative integer');
  }
}

function isValidImage(file) {
  if (!file?.buffer?.length) return false;
  if (file.mimetype === 'image/png') {
    const signature = Buffer.from('89504e470d0a1a0a', 'hex');
    return file.buffer.length >= 24
      && file.buffer.subarray(0, 8).equals(signature)
      && file.buffer.subarray(12, 16).toString('ascii') === 'IHDR';
  }
  if (file.mimetype === 'image/jpeg') {
    return file.buffer.length >= 4
      && file.buffer[0] === 0xff
      && file.buffer[1] === 0xd8
      && file.buffer.at(-2) === 0xff
      && file.buffer.at(-1) === 0xd9;
  }
  return false;
}

function escapePdfText(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}

function createInvoicePdf(invoice) {
  const lines = [
    'RosiHome Rental Invoice',
    `Reference: ${invoice.reference}`,
    `Billing period: ${invoice.period}`,
    `Issue date: ${invoice.issueDate}`,
    `Due date: ${invoice.dueDate}`,
    `Status: ${invoice.status}`,
    `Base rent: ${invoice.rentAmount} VND`,
    `Electricity: ${invoice.electricityUsage} kWh x ${invoice.electricityRate} = ${invoice.electricityAmount} VND`,
    `Water: ${invoice.waterUsage} m3 x ${invoice.waterRate} = ${invoice.waterAmount} VND`,
    `Additional fees: ${invoice.additionalFees} VND`,
    `Total: ${invoice.totalAmount} VND`,
  ];
  const commands = ['BT', '/F1 12 Tf', '50 790 Td', '16 TL'];
  for (const line of lines) commands.push(`(${escapePdfText(line)}) Tj`, 'T*');
  commands.push('ET');
  const stream = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'ascii');
}

async function roomContext(db, roomId) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
  if (!room) throw httpError(404, 'Room not found');
  const [property] = await db.select().from(properties).where(eq(properties.id, room.propertyId)).limit(1);
  return { room, property };
}

async function invoiceContext(db, invoiceId) {
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!invoice) throw httpError(404, 'Invoice not found');
  const context = await roomContext(db, invoice.roomId);
  return { invoice, ...context };
}

function ensureOwner(user, property, message = 'This record is not managed by the authenticated landlord') {
  if (user.role !== 'landlord' || property.ownerId !== user.id) throw httpError(403, message);
}

function ensureInvoiceAccess(user, context) {
  const isOwner = user.role === 'landlord' && context.property.ownerId === user.id;
  const isTenant = user.role === 'tenant'
    && context.invoice.tenantId === user.id
    && context.invoice.status !== 'draft';
  if (!isOwner && !isTenant) throw httpError(403, 'You do not have access to this invoice');
}

async function previousReading(db, roomId, period) {
  const [reading] = await db.select().from(meterReadings)
    .where(and(eq(meterReadings.roomId, roomId), lt(meterReadings.period, period)))
    .orderBy(desc(meterReadings.period))
    .limit(1);
  return reading;
}

async function serializeInvoice(db, invoice) {
  const [proof] = await db.select({
    id: paymentProofs.id,
    originalName: paymentProofs.originalName,
    mimeType: paymentProofs.mimeType,
    size: paymentProofs.size,
    uploadedBy: paymentProofs.uploadedBy,
    uploadedAt: paymentProofs.uploadedAt,
  }).from(paymentProofs).where(eq(paymentProofs.invoiceId, invoice.id)).limit(1);
  const [payment] = await db.select().from(payments).where(eq(payments.invoiceId, invoice.id)).limit(1);
  return {
    ...invoice,
    proof: proof ?? null,
    payment: payment ?? null,
    qrDataUrl: await toQrDataUrl(invoice.vietQrPayload),
  };
}

function referenceFor(room, period) {
  if (room.id === DEMO.roomId && period === '2026-07') return 'INV.POC.001';
  const roomPart = room.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 8) || 'ROOM';
  return `INV.${roomPart}.${period.replace('-', '')}`.slice(0, 25);
}

function leaseAppliesToPeriod(lease, period) {
  return lease.status === 'active'
    && lease.startsOn.slice(0, 7) <= period
    && lease.endsOn.slice(0, 7) >= period;
}

async function recordSkip(db, ownerId, roomId, period, reason) {
  await db.insert(billingRunSkips).values({ id: randomUUID(), ownerId, roomId, period, reason });
  return { roomId, reason };
}

export async function createApp(options = {}) {
  const databasePath = options.databasePath ?? 'memory://';
  const storagePath = path.resolve(options.storagePath ?? 'storage');
  const jwtSecret = options.jwtSecret ?? 'rosihome-poc-development-secret-32-characters';
  await mkdir(storagePath, { recursive: true });

  const { client, db } = await createDatabase(databasePath);
  await seedDemo(db);

  const app = express();
  app.use(express.json());

  app.post('/api/auth/demo', async (request, response, next) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, request.body.userId)).limit(1);
      if (!user) throw httpError(404, 'Demo user not found');
      const token = await new SignJWT({ role: user.role, name: user.fullName })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(user.id)
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(jwtKey(jwtSecret));
      response.json({ token, user: { id: user.id, fullName: user.fullName, role: user.role } });
    } catch (error) {
      next(error);
    }
  });

  app.use('/api', async (request, _response, next) => {
    try {
      const authorization = request.headers.authorization;
      if (!authorization?.startsWith('Bearer ')) throw httpError(401, 'Authentication required');
      const { payload } = await jwtVerify(authorization.slice(7), jwtKey(jwtSecret));
      request.user = { id: payload.sub, role: payload.role, fullName: payload.name };
      next();
    } catch (error) {
      next(error.status ? error : httpError(401, 'Invalid or expired token'));
    }
  });

  app.get('/api/demo', (_request, response) => {
    response.json({
      users: {
        landlord: DEMO.landlordId,
        tenant: DEMO.tenantId,
        unrelatedLandlord: DEMO.unrelatedLandlordId,
        unrelatedTenant: DEMO.unrelatedTenantId,
      },
      propertyId: DEMO.propertyId,
      roomId: DEMO.roomId,
      period: '2026-07',
      referenceReading: { electricity: 1_320, water: 84 },
    });
  });

  app.get('/api/payment-settings', async (request, response, next) => {
    try {
      if (request.user.role !== 'landlord') throw httpError(403, 'Only landlords can view payment settings');
      const [settings] = await db.select().from(landlordPaymentSettings)
        .where(eq(landlordPaymentSettings.landlordId, request.user.id)).limit(1);
      response.json(settings ?? null);
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/payment-settings', async (request, response, next) => {
    try {
      if (request.user.role !== 'landlord') throw httpError(403, 'Only landlords can update payment settings');
      const { bankBin, bankAccount, accountHolder } = request.body;
      if (!/^\d{6}$/.test(bankBin ?? '')) throw httpError(400, 'Bank BIN must contain 6 digits');
      if (!/^[A-Za-z0-9]{5,19}$/.test(bankAccount ?? '')) {
        throw httpError(400, 'Bank account must contain 5 to 19 letters or digits');
      }
      if (typeof accountHolder !== 'string' || accountHolder.trim().length < 2 || accountHolder.trim().length > 100) {
        throw httpError(400, 'Account holder must contain 2 to 100 characters');
      }
      const [existing] = await db.select().from(landlordPaymentSettings)
        .where(eq(landlordPaymentSettings.landlordId, request.user.id)).limit(1);
      const values = { bankBin, bankAccount, accountHolder: accountHolder.trim(), updatedAt: new Date() };
      if (existing) {
        await db.update(landlordPaymentSettings).set(values)
          .where(eq(landlordPaymentSettings.landlordId, request.user.id));
      } else {
        await db.insert(landlordPaymentSettings).values({ landlordId: request.user.id, ...values });
      }
      const [updated] = await db.select().from(landlordPaymentSettings)
        .where(eq(landlordPaymentSettings.landlordId, request.user.id)).limit(1);
      response.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/properties/:propertyId/utility-rates', async (request, response, next) => {
    try {
      const [property] = await db.select().from(properties)
        .where(eq(properties.id, request.params.propertyId)).limit(1);
      if (!property) throw httpError(404, 'Property not found');
      ensureOwner(request.user, property, 'Only the owning landlord can update utility rates');
      const { electricityRate, waterRate } = request.body;
      if (!Number.isSafeInteger(electricityRate) || electricityRate < 0
        || !Number.isSafeInteger(waterRate) || waterRate < 0) {
        throw httpError(400, 'Utility rates must be non-negative integer VND amounts');
      }
      await db.update(properties).set({ electricityRate, waterRate }).where(eq(properties.id, property.id));
      const [updated] = await db.select().from(properties).where(eq(properties.id, property.id)).limit(1);
      response.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/meter-readings', async (request, response, next) => {
    try {
      const { roomId, period, electricity, water } = request.body;
      if (!PERIOD_PATTERN.test(period ?? '')) throw httpError(400, 'Period must use YYYY-MM format');
      validateReadings(electricity, water);
      const context = await roomContext(db, roomId);
      ensureOwner(request.user, context.property, 'Only the owning landlord can record meter readings');
      const [duplicate] = await db.select().from(meterReadings)
        .where(and(eq(meterReadings.roomId, roomId), eq(meterReadings.period, period))).limit(1);
      if (duplicate) throw httpError(409, 'A meter reading already exists for this room and period');
      const previous = await previousReading(db, roomId, period);
      if (previous && (electricity < previous.electricity || water < previous.water)) {
        throw httpError(400, 'Current readings must be greater than or equal to previous readings');
      }
      const id = randomUUID();
      await db.insert(meterReadings).values({
        id, roomId, period, electricity, water, createdBy: request.user.id,
      });
      const [created] = await db.select().from(meterReadings).where(eq(meterReadings.id, id)).limit(1);
      response.status(201).json({
        ...created,
        isBaseline: !previous,
        previous: previous ? { electricity: previous.electricity, water: previous.water, period: previous.period } : null,
        calculation: previous ? {
          electricityUsage: electricity - previous.electricity,
          electricityAmount: (electricity - previous.electricity) * context.property.electricityRate,
          waterUsage: water - previous.water,
          waterAmount: (water - previous.water) * context.property.waterRate,
        } : null,
      });
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/meter-readings/:readingId', async (request, response, next) => {
    try {
      const [reading] = await db.select().from(meterReadings)
        .where(eq(meterReadings.id, request.params.readingId)).limit(1);
      if (!reading) throw httpError(404, 'Meter reading not found');
      const context = await roomContext(db, reading.roomId);
      ensureOwner(request.user, context.property, 'Only the owning landlord can correct a meter reading');
      const [invoice] = await db.select().from(invoices)
        .where(and(eq(invoices.roomId, reading.roomId), eq(invoices.period, reading.period))).limit(1);
      if (!invoice) throw httpError(409, 'The reading is not linked to a generated draft invoice');
      if (invoice.status !== 'draft') throw httpError(409, 'Only a reading used by a Draft invoice can be corrected');
      const { electricity, water } = request.body;
      validateReadings(electricity, water);
      const previous = await previousReading(db, reading.roomId, reading.period);
      if (!previous) throw httpError(409, 'Previous meter reading not found');
      if (electricity < previous.electricity || water < previous.water) {
        throw httpError(400, 'Corrected readings must be greater than or equal to previous readings');
      }
      if (electricity === reading.electricity && water === reading.water) {
        return response.json({ changed: false, reading, invoice: await serializeInvoice(db, invoice) });
      }

      const electricityUsage = electricity - previous.electricity;
      const waterUsage = water - previous.water;
      const electricityAmount = electricityUsage * invoice.electricityRate;
      const waterAmount = waterUsage * invoice.waterRate;
      const totalAmount = invoice.rentAmount + electricityAmount + waterAmount + invoice.additionalFees;
      const [settings] = await db.select().from(landlordPaymentSettings)
        .where(eq(landlordPaymentSettings.landlordId, request.user.id)).limit(1);
      const vietQrPayload = generateVietQrPayload({
        bankBin: settings.bankBin,
        bankAccount: settings.bankAccount,
        amount: totalAmount,
        reference: invoice.reference,
      });

      await db.transaction(async (transaction) => {
        await transaction.insert(meterReadingCorrections).values({
          id: randomUUID(),
          meterReadingId: reading.id,
          actorId: request.user.id,
          previousElectricity: reading.electricity,
          newElectricity: electricity,
          previousWater: reading.water,
          newWater: water,
        });
        await transaction.update(meterReadings).set({ electricity, water }).where(eq(meterReadings.id, reading.id));
        await transaction.update(invoices).set({
          currentElectricity: electricity,
          electricityUsage,
          electricityAmount,
          currentWater: water,
          waterUsage,
          waterAmount,
          totalAmount,
          vietQrPayload,
        }).where(eq(invoices.id, invoice.id));
      });
      const [updatedReading] = await db.select().from(meterReadings).where(eq(meterReadings.id, reading.id)).limit(1);
      const [updatedInvoice] = await db.select().from(invoices).where(eq(invoices.id, invoice.id)).limit(1);
      response.json({ changed: true, reading: updatedReading, invoice: await serializeInvoice(db, updatedInvoice) });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/meter-readings/:readingId/corrections', async (request, response, next) => {
    try {
      const [reading] = await db.select().from(meterReadings)
        .where(eq(meterReadings.id, request.params.readingId)).limit(1);
      if (!reading) throw httpError(404, 'Meter reading not found');
      const context = await roomContext(db, reading.roomId);
      ensureOwner(request.user, context.property, 'Only the owning landlord can view reading corrections');
      const corrections = await db.select().from(meterReadingCorrections)
        .where(eq(meterReadingCorrections.meterReadingId, reading.id))
        .orderBy(meterReadingCorrections.createdAt);
      response.json(corrections);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/billing-runs', async (request, response, next) => {
    try {
      if (request.user.role !== 'landlord') throw httpError(403, 'Only landlords can run monthly billing');
      const { period, additionalFees = 0 } = request.body;
      const issueDate = request.body.issueDate ?? new Date().toISOString().slice(0, 10);
      const dueDate = request.body.dueDate;
      if (!PERIOD_PATTERN.test(period ?? '')) throw httpError(400, 'Period must use YYYY-MM format');
      if (!DATE_PATTERN.test(issueDate ?? '') || !DATE_PATTERN.test(dueDate ?? '') || dueDate < issueDate) {
        throw httpError(400, 'Issue and due dates must be valid YYYY-MM-DD values with due date on or after issue date');
      }
      if (!Number.isSafeInteger(additionalFees) || additionalFees < 0) {
        throw httpError(400, 'Additional fees must be a non-negative integer VND amount');
      }
      const [settings] = await db.select().from(landlordPaymentSettings)
        .where(eq(landlordPaymentSettings.landlordId, request.user.id)).limit(1);
      if (!settings) throw httpError(409, 'Landlord payment settings are required before billing');

      const ownedProperties = (await db.select().from(properties)).filter((item) => item.ownerId === request.user.id);
      const ownedPropertyIds = new Set(ownedProperties.map((item) => item.id));
      const ownedRooms = (await db.select().from(rooms)).filter((item) => ownedPropertyIds.has(item.propertyId));
      const allLeases = await db.select().from(leases);
      const created = [];
      const skipped = [];

      for (const room of ownedRooms) {
        const property = ownedProperties.find((item) => item.id === room.propertyId);
        const lease = allLeases.find((item) => item.roomId === room.id && leaseAppliesToPeriod(item, period));
        if (!lease) {
          skipped.push(await recordSkip(db, request.user.id, room.id, period, 'no_active_lease'));
          continue;
        }
        const [current] = await db.select().from(meterReadings)
          .where(and(eq(meterReadings.roomId, room.id), eq(meterReadings.period, period))).limit(1);
        if (!current) {
          skipped.push(await recordSkip(db, request.user.id, room.id, period, 'missing_current_reading'));
          continue;
        }
        const previous = await previousReading(db, room.id, period);
        if (!previous) {
          skipped.push(await recordSkip(db, request.user.id, room.id, period, 'missing_baseline_reading'));
          continue;
        }
        const [existing] = await db.select().from(invoices)
          .where(and(eq(invoices.roomId, room.id), eq(invoices.period, period))).limit(1);
        if (existing) {
          skipped.push(await recordSkip(db, request.user.id, room.id, period, 'already_invoiced'));
          continue;
        }
        if (current.electricity < previous.electricity || current.water < previous.water) {
          skipped.push(await recordSkip(db, request.user.id, room.id, period, 'invalid_reading_order'));
          continue;
        }

        const electricityUsage = current.electricity - previous.electricity;
        const waterUsage = current.water - previous.water;
        const electricityAmount = electricityUsage * property.electricityRate;
        const waterAmount = waterUsage * property.waterRate;
        const totalAmount = room.baseRent + electricityAmount + waterAmount + additionalFees;
        const reference = referenceFor(room, period);
        const vietQrPayload = generateVietQrPayload({
          bankBin: settings.bankBin,
          bankAccount: settings.bankAccount,
          amount: totalAmount,
          reference,
        });
        const invoiceId = randomUUID();
        await db.transaction(async (transaction) => {
          await transaction.insert(invoices).values({
            id: invoiceId,
            reference,
            roomId: room.id,
            leaseId: lease.id,
            meterReadingId: current.id,
            tenantId: lease.tenantId,
            period,
            rentAmount: room.baseRent,
            previousElectricity: previous.electricity,
            currentElectricity: current.electricity,
            electricityUsage,
            electricityRate: property.electricityRate,
            electricityAmount,
            previousWater: previous.water,
            currentWater: current.water,
            waterUsage,
            waterRate: property.waterRate,
            waterAmount,
            additionalFees,
            totalAmount,
            issueDate,
            dueDate,
            status: 'draft',
            vietQrPayload,
          });
          await transaction.insert(invoiceStatusHistory).values({
            id: randomUUID(), invoiceId, actorId: request.user.id, previousStatus: null, newStatus: 'draft',
          });
        });
        const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
        created.push(await serializeInvoice(db, invoice));
      }
      response.status(201).json({ period, created, skipped });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/invoices', async (request, response, next) => {
    try {
      const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
      const accessible = [];
      for (const invoice of allInvoices) {
        const context = await invoiceContext(db, invoice.id);
        const isOwner = request.user.role === 'landlord' && context.property.ownerId === request.user.id;
        const isTenant = request.user.role === 'tenant'
          && invoice.tenantId === request.user.id
          && invoice.status !== 'draft';
        if (isOwner || isTenant) accessible.push(await serializeInvoice(db, invoice));
      }
      response.json(accessible);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/invoices/:invoiceId', async (request, response, next) => {
    try {
      const context = await invoiceContext(db, request.params.invoiceId);
      ensureInvoiceAccess(request.user, context);
      response.json(await serializeInvoice(db, context.invoice));
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/invoices/:invoiceId/send', async (request, response, next) => {
    try {
      const context = await invoiceContext(db, request.params.invoiceId);
      ensureOwner(request.user, context.property, 'Only the owning landlord can send this invoice');
      if (context.invoice.status !== 'draft') throw httpError(409, 'Only a Draft invoice can be sent');
      const sentAt = new Date();
      await db.transaction(async (transaction) => {
        await transaction.update(invoices).set({ status: 'sent', sentBy: request.user.id, sentAt })
          .where(eq(invoices.id, context.invoice.id));
        await transaction.insert(invoiceStatusHistory).values({
          id: randomUUID(),
          invoiceId: context.invoice.id,
          actorId: request.user.id,
          previousStatus: 'draft',
          newStatus: 'sent',
        });
        await transaction.insert(notificationEvents).values({
          id: randomUUID(),
          userId: context.invoice.tenantId,
          invoiceId: context.invoice.id,
          type: 'invoice_sent',
          channel: 'mobile_push_simulated',
          deliveryStatus: 'simulated',
        });
      });
      const [updated] = await db.select().from(invoices).where(eq(invoices.id, context.invoice.id)).limit(1);
      response.json(await serializeInvoice(db, updated));
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/invoices/:invoiceId/pdf', async (request, response, next) => {
    try {
      const context = await invoiceContext(db, request.params.invoiceId);
      ensureInvoiceAccess(request.user, context);
      const pdf = createInvoicePdf(context.invoice);
      response.type('application/pdf');
      response.setHeader('Content-Disposition', `attachment; filename="${context.invoice.reference}.pdf"`);
      response.send(pdf);
    } catch (error) {
      next(error);
    }
  });

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_request, file, callback) => {
      if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
        return callback(httpError(400, 'Only JPEG and PNG payment proofs are accepted'));
      }
      callback(null, true);
    },
  });

  app.post('/api/invoices/:invoiceId/proof', upload.single('proof'), async (request, response, next) => {
    let destination;
    try {
      if (!request.file) throw httpError(400, 'Payment proof is required');
      if (!isValidImage(request.file)) throw httpError(400, 'Payment proof content is not a valid JPEG or PNG image');
      const context = await invoiceContext(db, request.params.invoiceId);
      if (request.user.role !== 'tenant' || context.invoice.tenantId !== request.user.id) {
        throw httpError(403, 'Only the assigned tenant can upload payment proof');
      }
      if (context.invoice.status !== 'sent') {
        throw httpError(409, 'Payment proof can be uploaded only for a Sent unpaid invoice');
      }
      const [existing] = await db.select().from(paymentProofs)
        .where(eq(paymentProofs.invoiceId, context.invoice.id)).limit(1);
      if (existing) throw httpError(409, 'A payment proof already exists for this invoice');

      const extension = request.file.mimetype === 'image/png' ? '.png' : '.jpg';
      const proofId = randomUUID();
      const storageKey = `${context.invoice.id}/${proofId}${extension}`;
      destination = path.join(storagePath, storageKey);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, request.file.buffer);

      await db.transaction(async (transaction) => {
        await transaction.insert(paymentProofs).values({
          id: proofId,
          invoiceId: context.invoice.id,
          uploadedBy: request.user.id,
          originalName: path.basename(request.file.originalname),
          mimeType: request.file.mimetype,
          size: request.file.size,
          storageKey,
        });
        await transaction.update(invoices).set({ status: 'proof_submitted' })
          .where(eq(invoices.id, context.invoice.id));
        await transaction.insert(invoiceStatusHistory).values({
          id: randomUUID(),
          invoiceId: context.invoice.id,
          actorId: request.user.id,
          previousStatus: 'sent',
          newStatus: 'proof_submitted',
        });
        await transaction.insert(notificationEvents).values({
          id: randomUUID(),
          userId: context.property.ownerId,
          invoiceId: context.invoice.id,
          type: 'payment_proof_submitted',
          channel: 'mobile_push_simulated',
          deliveryStatus: 'simulated',
        });
      });

      const [updated] = await db.select().from(invoices).where(eq(invoices.id, context.invoice.id)).limit(1);
      response.status(201).json(await serializeInvoice(db, updated));
    } catch (error) {
      if (destination) await unlink(destination).catch(() => {});
      next(error);
    }
  });

  app.get('/api/invoices/:invoiceId/proof', async (request, response, next) => {
    try {
      const context = await invoiceContext(db, request.params.invoiceId);
      ensureInvoiceAccess(request.user, context);
      const [proof] = await db.select().from(paymentProofs)
        .where(eq(paymentProofs.invoiceId, context.invoice.id)).limit(1);
      if (!proof) throw httpError(404, 'Payment proof not found');
      const file = await readFile(path.join(storagePath, proof.storageKey));
      response.type(proof.mimeType);
      response.setHeader('Content-Disposition', `inline; filename="${path.basename(proof.originalName)}"`);
      response.send(file);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/payment-proofs/pending', async (request, response, next) => {
    try {
      if (request.user.role !== 'landlord') throw httpError(403, 'Only landlords can list pending payment proofs');
      const pending = [];
      const candidates = (await db.select().from(invoices)).filter((invoice) => invoice.status === 'proof_submitted');
      for (const invoice of candidates) {
        const context = await invoiceContext(db, invoice.id);
        if (context.property.ownerId === request.user.id) pending.push(await serializeInvoice(db, invoice));
      }
      response.json(pending);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/invoices/:invoiceId/confirm', async (request, response, next) => {
    try {
      const context = await invoiceContext(db, request.params.invoiceId);
      ensureOwner(request.user, context.property, 'Only the managing landlord can confirm payment');
      if (context.invoice.status === 'paid') {
        return response.json({ changed: false, invoice: await serializeInvoice(db, context.invoice) });
      }
      if (context.invoice.status !== 'proof_submitted') {
        throw httpError(409, 'A submitted payment proof is required before confirmation');
      }
      const [proof] = await db.select().from(paymentProofs)
        .where(eq(paymentProofs.invoiceId, context.invoice.id)).limit(1);
      if (!proof) throw httpError(409, 'Payment proof not found');
      await db.transaction(async (transaction) => {
        await transaction.insert(payments).values({
          id: randomUUID(),
          invoiceId: context.invoice.id,
          amount: context.invoice.totalAmount,
          verifiedBy: request.user.id,
        });
        await transaction.update(invoices).set({ status: 'paid' }).where(eq(invoices.id, context.invoice.id));
        await transaction.insert(invoiceStatusHistory).values({
          id: randomUUID(),
          invoiceId: context.invoice.id,
          actorId: request.user.id,
          previousStatus: 'proof_submitted',
          newStatus: 'paid',
        });
      });
      const [updated] = await db.select().from(invoices).where(eq(invoices.id, context.invoice.id)).limit(1);
      response.json({ changed: true, invoice: await serializeInvoice(db, updated) });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/invoices/:invoiceId/history', async (request, response, next) => {
    try {
      const context = await invoiceContext(db, request.params.invoiceId);
      ensureInvoiceAccess(request.user, context);
      const history = await db.select().from(invoiceStatusHistory)
        .where(eq(invoiceStatusHistory.invoiceId, context.invoice.id))
        .orderBy(invoiceStatusHistory.createdAt);
      response.json({ invoiceId: context.invoice.id, status: context.invoice.status, history });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/payments/summary', async (request, response, next) => {
    try {
      const accessible = [];
      for (const invoice of await db.select().from(invoices)) {
        const context = await invoiceContext(db, invoice.id);
        const isOwner = request.user.role === 'landlord' && context.property.ownerId === request.user.id;
        const isTenant = request.user.role === 'tenant'
          && invoice.tenantId === request.user.id
          && invoice.status !== 'draft';
        if (!isOwner && !isTenant) continue;
        const [payment] = await db.select().from(payments).where(eq(payments.invoiceId, invoice.id)).limit(1);
        accessible.push({
          invoiceId: invoice.id,
          reference: invoice.reference,
          period: invoice.period,
          amount: invoice.totalAmount,
          status: invoice.status,
          verificationDate: payment?.verifiedAt ?? null,
        });
      }
      response.json({
        outstandingTotal: accessible
          .filter((item) => item.status !== 'paid')
          .reduce((total, item) => total + item.amount, 0),
        history: accessible.sort((left, right) => right.period.localeCompare(left.period)),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/notifications', async (request, response, next) => {
    try {
      const events = await db.select().from(notificationEvents)
        .where(eq(notificationEvents.userId, request.user.id))
        .orderBy(desc(notificationEvents.createdAt));
      response.json(events);
    } catch (error) {
      next(error);
    }
  });

  app.use(express.static(path.resolve('dist')));

  app.use((error, _request, response, _next) => {
    if (error instanceof multer.MulterError) {
      const message = error.code === 'LIMIT_FILE_SIZE' ? 'Payment proof must not exceed 5 MB' : error.message;
      return response.status(400).json({ error: message });
    }
    const status = error.status ?? 500;
    if (status >= 500) console.error(error);
    return response.status(status).json({ error: error.message ?? 'Internal server error' });
  });

  return { app, db, client, demo: DEMO };
}
