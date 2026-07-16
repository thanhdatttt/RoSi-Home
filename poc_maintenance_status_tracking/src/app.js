import { randomUUID } from 'node:crypto';
import path from 'node:path';
import express from 'express';
import { SignJWT, jwtVerify } from 'jose';
import { desc, eq } from 'drizzle-orm';
import { createDatabase, DEMO, seedDemo } from './database.js';
import {
  maintenanceRequests,
  maintenanceStatusHistory,
  notificationEvents,
  properties,
  rooms,
  users,
} from './schema.js';

const ALLOWED_STATUSES = new Set(['pending', 'in_progress', 'completed']);
const NEXT_STATUS = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: null,
};

const httpError = (status, message) => Object.assign(new Error(message), { status });

function jwtKey(secret) {
  return new TextEncoder().encode(secret);
}

async function requestContext(db, requestId) {
  const [maintenanceRequest] = await db.select().from(maintenanceRequests)
    .where(eq(maintenanceRequests.id, requestId)).limit(1);
  if (!maintenanceRequest) throw httpError(404, 'Maintenance request not found');
  const [room] = await db.select().from(rooms).where(eq(rooms.id, maintenanceRequest.roomId)).limit(1);
  const [property] = await db.select().from(properties).where(eq(properties.id, room.propertyId)).limit(1);
  const [tenant] = await db.select().from(users).where(eq(users.id, maintenanceRequest.tenantId)).limit(1);
  return { maintenanceRequest, room, property, tenant };
}

function canAccess(user, context) {
  const isOwner = user.role === 'landlord' && context.property.ownerId === user.id;
  const isTenant = user.role === 'tenant' && context.maintenanceRequest.tenantId === user.id;
  return isOwner || isTenant;
}

function ensureAccess(user, context) {
  if (!canAccess(user, context)) throw httpError(403, 'You do not have access to this maintenance request');
}

function ensureOwner(user, context) {
  if (user.role !== 'landlord' || context.property.ownerId !== user.id) {
    throw httpError(403, 'Only the owning landlord can update this maintenance request');
  }
}

async function serializeRequest(db, context, { includeHistory = false } = {}) {
  const history = includeHistory
    ? await db.select().from(maintenanceStatusHistory)
      .where(eq(maintenanceStatusHistory.requestId, context.maintenanceRequest.id))
      .orderBy(maintenanceStatusHistory.createdAt)
    : undefined;
  return {
    ...context.maintenanceRequest,
    property: { id: context.property.id, name: context.property.name },
    room: { id: context.room.id, name: context.room.name },
    tenant: { id: context.tenant.id, fullName: context.tenant.fullName },
    attachments: [],
    ...(includeHistory ? { history } : {}),
  };
}

export async function createApp(options = {}) {
  const databasePath = options.databasePath ?? 'memory://';
  const jwtSecret = options.jwtSecret ?? 'rosihome-maintenance-poc-secret-32-characters';
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
      roomId: DEMO.roomId,
      requestId: DEMO.requestId,
    });
  });

  app.get('/api/maintenance-requests', async (request, response, next) => {
    try {
      const status = request.query.status;
      if (status && !ALLOWED_STATUSES.has(status)) {
        throw httpError(400, 'Status filter must be pending, in_progress, or completed');
      }
      const result = [];
      const allRequests = await db.select().from(maintenanceRequests)
        .orderBy(desc(maintenanceRequests.submittedAt));
      for (const maintenanceRequest of allRequests) {
        if (status && maintenanceRequest.status !== status) continue;
        const context = await requestContext(db, maintenanceRequest.id);
        if (canAccess(request.user, context)) result.push(await serializeRequest(db, context));
      }
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/maintenance-requests/:requestId', async (request, response, next) => {
    try {
      const context = await requestContext(db, request.params.requestId);
      ensureAccess(request.user, context);
      response.json(await serializeRequest(db, context, { includeHistory: true }));
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/maintenance-requests/:requestId/status', async (request, response, next) => {
    try {
      const nextStatus = request.body.status;
      if (!ALLOWED_STATUSES.has(nextStatus)) {
        throw httpError(400, 'Status must be pending, in_progress, or completed');
      }
      const context = await requestContext(db, request.params.requestId);
      ensureOwner(request.user, context);
      const currentStatus = context.maintenanceRequest.status;
      if (nextStatus === currentStatus) {
        return response.json({
          changed: false,
          request: await serializeRequest(db, context, { includeHistory: true }),
        });
      }
      if (NEXT_STATUS[currentStatus] !== nextStatus) {
        throw httpError(409, `Invalid transition: ${currentStatus} can change only to ${NEXT_STATUS[currentStatus] ?? 'no further status'}`);
      }

      await db.transaction(async (transaction) => {
        await transaction.update(maintenanceRequests)
          .set({ status: nextStatus, updatedAt: new Date() })
          .where(eq(maintenanceRequests.id, context.maintenanceRequest.id));
        await transaction.insert(maintenanceStatusHistory).values({
          id: randomUUID(),
          requestId: context.maintenanceRequest.id,
          actorId: request.user.id,
          previousStatus: currentStatus,
          newStatus: nextStatus,
        });
        await transaction.insert(notificationEvents).values({
          id: randomUUID(),
          userId: context.maintenanceRequest.tenantId,
          requestId: context.maintenanceRequest.id,
          type: 'maintenance_status_changed',
          channel: 'mobile_push_simulated',
          deliveryStatus: 'simulated',
        });
      });

      const updatedContext = await requestContext(db, context.maintenanceRequest.id);
      response.json({
        changed: true,
        request: await serializeRequest(db, updatedContext, { includeHistory: true }),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/rooms/:roomId/maintenance-history', async (request, response, next) => {
    try {
      const [room] = await db.select().from(rooms).where(eq(rooms.id, request.params.roomId)).limit(1);
      if (!room) throw httpError(404, 'Room not found');
      const [property] = await db.select().from(properties).where(eq(properties.id, room.propertyId)).limit(1);
      if (request.user.role !== 'landlord' || property.ownerId !== request.user.id) {
        throw httpError(403, 'Only the owning landlord can view room maintenance history');
      }
      const result = [];
      const allRequests = await db.select().from(maintenanceRequests)
        .orderBy(desc(maintenanceRequests.submittedAt));
      for (const maintenanceRequest of allRequests) {
        if (maintenanceRequest.roomId !== room.id) continue;
        const context = await requestContext(db, maintenanceRequest.id);
        result.push(await serializeRequest(db, context, { includeHistory: true }));
      }
      response.json({ room: { id: room.id, name: room.name }, requests: result });
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
    const status = error.status ?? 500;
    if (status >= 500) console.error(error);
    response.status(status).json({ error: error.message ?? 'Internal server error' });
  });

  return { app, db, client, demo: DEMO };
}
