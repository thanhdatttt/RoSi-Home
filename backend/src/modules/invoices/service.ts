import { db } from "../../db/index.js";
import { notifications } from "../../db/schema.js";
import { writeAudit } from "../../db/audit.js";
import {
  NotFoundError,
  UnprocessableError,
} from "../../lib/errors.js";
import { roundVnd } from "../../lib/money.js";
import {
  deriveInvoiceDates,
  isValidBillingPeriod,
  periodBounds,
  previousMonthPeriod,
} from "../../lib/billingPeriod.js";
import { sendNotification } from "../notifications/service.js";
import {
  findActiveLeaseForRoomPeriod,
  findActiveLeasesForPropertyPeriod,
  countActiveLeasesForRoomPeriod,
  findPropertiesWithActiveLeases,
  type ActiveLeaseContext,
} from "../leases/repository.js";
import { resolveWaterRate } from "../utilities/rateResolver.js";
import { findActiveReading, type MeterReadingRow } from "../meters/repository.js";
import { findActiveSurchargesForPropertyPeriod } from "../charges/repository.js";
import {
  assertPropertyOwned,
  createInvoiceGenerationSkip,
  createInvoiceWithLineItems,
  deleteInvoiceLineItems,
  findActiveInvoiceForRoomPeriod,
  findExistingInvoice,
  findInvoiceLineItems,
  getInvoiceDetail,
  insertInvoiceLineItems,
  updateInvoice,
  type InvoiceDetail,
  type InvoiceLineItemRow,
  type NewInvoiceLineItem,
} from "./repository.js";

export type LineItemView = {
  id: string;
  type: string;
  description: string;
  quantity: number | null;
  unitRate: number | null;
  amount: number;
  sourceRateId: string | null;
};

export type InvoiceView = {
  id: string;
  leaseId: string;
  roomId: string;
  billingPeriod: string;
  status: "Draft" | "Sent" | "Paid";
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  sentBy: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  lineItems: LineItemView[];
};

function serializeInvoice(
  detail: InvoiceDetail,
  lineItems: InvoiceLineItemRow[],
): InvoiceView {
  return {
    id: detail.id,
    leaseId: detail.leaseId,
    roomId: detail.roomId,
    billingPeriod: detail.billingPeriod,
    status: detail.status,
    issueDate: String(detail.issueDate),
    dueDate: String(detail.dueDate),
    totalAmount: detail.totalAmount,
    sentBy: detail.sentBy,
    sentAt: detail.sentAt ? detail.sentAt.toISOString() : null,
    createdAt: detail.createdAt.toISOString(),
    updatedAt: detail.updatedAt.toISOString(),
    lineItems: lineItems.map((li) => ({
      id: li.id,
      type: li.type,
      description: li.description,
      quantity: li.quantity === null ? null : Number(li.quantity),
      unitRate: li.unitRate,
      amount: li.amount,
      sourceRateId: li.sourceRateId,
    })),
  };
}

// US-AUTH-04 — ownership/role enforcement for invoice access.
function authorizeDetail(
  detail: InvoiceDetail,
  actorId: string,
  role: "Landlord" | "Tenant",
): void {
  if (role === "Landlord") {
    if (detail.landlordId !== actorId) {
      throw new NotFoundError("Invoice not found.");
    }
    return;
  }
  // Tenant: only their own invoice, and never a landlord-only draft.
  if (detail.tenantUserId !== actorId) {
    throw new NotFoundError("Invoice not found.");
  }
  if (detail.status === "Draft") {
    throw new NotFoundError("Invoice not found.");
  }
}

async function notifyTenantOfInvoice(
  tenantUserId: string | null,
  invoiceId: string,
  propertyName: string,
  billingPeriod: string,
  dueDate: string,
  total: number,
): Promise<void> {
  if (!tenantUserId) return;
  const dedupeKey = `invoice.sent:${invoiceId}`;
  const [notif] = await db
    .insert(notifications)
    .values({
      userId: tenantUserId,
      type: "invoice.sent",
      title: "New invoice available",
      body: `Invoice for ${billingPeriod} at ${propertyName} is ready. Total ${total.toLocaleString(
        "en-US",
      )} VND, due ${dueDate}.`,
      linkRef: `invoices/${invoiceId}`,
      channel: "Push",
      deliveryStatus: "Sent",
      dedupeKey,
    })
    .returning();

  await sendNotification({
    userId: tenantUserId,
    type: "invoice.sent",
    title: notif.title,
    body: notif.body,
    linkRef: notif.linkRef ?? "",
    dedupeKey,
  });
}

type LineItemInput = Omit<NewInvoiceLineItem, "invoiceId">;

async function buildLineItems(
  ctx: ActiveLeaseContext,
  periodStart: string,
  periodEnd: string,
  elec: MeterReadingRow,
  waterReading: MeterReadingRow | null,
  waterMethod: "Metered" | "Flat",
  executor: typeof db = db,
): Promise<LineItemInput[]> {
  const items: LineItemInput[] = [];

  items.push({
    type: "rent",
    description: "Base rent",
    quantity: null,
    unitRate: null,
    amount: ctx.agreedRent,
    sourceRateId: null,
  });

  items.push({
    type: "electricity",
    description: "Electricity",
    quantity: elec.consumption,
    unitRate: elec.unitRate,
    amount: elec.amount,
    sourceRateId: elec.rateSourceId,
  });

  if (waterMethod === "Metered" && waterReading) {
    items.push({
      type: "water",
      description: "Water (metered)",
      quantity: waterReading.consumption,
      unitRate: waterReading.unitRate,
      amount: waterReading.amount,
      sourceRateId: waterReading.rateSourceId,
    });
  } else if (waterMethod === "Flat") {
    const water = await resolveWaterRate(ctx.propertyId, ctx.locality, periodEnd);
    const tenantCount = await countActiveLeasesForRoomPeriod(
      ctx.roomId,
      periodStart,
      periodEnd,
      executor,
    );
    const flat = water.flatAmountPerTenant!;
    items.push({
      type: "water",
      description: "Water (flat)",
      quantity: String(tenantCount),
      unitRate: flat,
      amount: roundVnd(flat * tenantCount),
      sourceRateId: water.sourceId,
    });
  }

  const surchargeRows = await findActiveSurchargesForPropertyPeriod(
    ctx.propertyId,
    periodStart,
    periodEnd,
    executor,
  );
  for (const s of surchargeRows) {
    items.push({
      type: "surcharge",
      description: s.name,
      quantity: null,
      unitRate: null,
      amount: s.monthlyAmount,
      sourceRateId: s.id,
    });
  }

  return items;
}

function totalOf(items: LineItemInput[]): number {
  return roundVnd(items.reduce((sum, i) => sum + (i.amount ?? 0), 0));
}

// US-INVOICE-01 — generate a draft invoice per active lease for the period.
export async function generateInvoicesForProperty(
  landlordId: string,
  propertyId: string,
  period: string,
): Promise<{ generated: number; skipped: number }> {
  await assertPropertyOwned(propertyId, landlordId);
  if (!isValidBillingPeriod(period)) {
    throw new UnprocessableError("Invalid billing period; expected YYYY-MM.");
  }

  const bounds = periodBounds(period);
  const leasesCtx = await findActiveLeasesForPropertyPeriod(
    propertyId,
    bounds.start,
    bounds.end,
  );

  let generated = 0;
  let skipped = 0;

  for (const ctx of leasesCtx) {
    const result = await db.transaction(async (rawTrx) => {
      const trx = rawTrx as unknown as typeof db;

      const existing = await findExistingInvoice(ctx.leaseId, period, trx);
      if (existing) return "existing" as const;

      let waterMethod: "Metered" | "Flat";
      try {
        const water = await resolveWaterRate(ctx.propertyId, ctx.locality, bounds.end);
        waterMethod = water.method!;
      } catch (err) {
        if (err instanceof UnprocessableError) {
          await createInvoiceGenerationSkip(
            ctx.leaseId,
            period,
            "No applicable utility rate configured for the property locality and billing period.",
            trx,
          );
          return "skipped" as const;
        }
        throw err;
      }

      const elec = await findActiveReading(ctx.roomId, "Electricity", period, trx);
      if (!elec) {
        await createInvoiceGenerationSkip(
          ctx.leaseId,
          period,
          `Missing electricity reading for ${period}.`,
          trx,
        );
        return "skipped" as const;
      }

      let waterReading = null;
      if (waterMethod === "Metered") {
        waterReading = await findActiveReading(ctx.roomId, "Water", period, trx);
        if (!waterReading) {
          await createInvoiceGenerationSkip(
            ctx.leaseId,
            period,
            `Missing water reading for ${period}.`,
            trx,
          );
          return "skipped" as const;
        }
      }

      const items = await buildLineItems(
        ctx,
        bounds.start,
        bounds.end,
        elec,
        waterReading,
        waterMethod,
        trx,
      );
      const { issueDate, dueDate } = deriveInvoiceDates(period);
      const total = totalOf(items);

      const invoice = await createInvoiceWithLineItems(
        {
          leaseId: ctx.leaseId,
          roomId: ctx.roomId,
          billingPeriod: period,
          status: "Draft",
          issueDate,
          dueDate,
          totalAmount: total,
        },
        items,
        trx,
      );

      await writeAudit(
        {
          actorUserId: landlordId,
          action: "invoice.generated",
          entityType: "invoices",
          entityId: invoice.id,
          afterValue: {
            leaseId: ctx.leaseId,
            billingPeriod: period,
            totalAmount: total,
            lineItems: items.length,
          },
        },
        trx,
      );

      return "generated" as const;
    });

    if (result === "generated") generated++;
    else if (result === "skipped") skipped++;
  }

  return { generated, skipped };
}

// US-INVOICE-01 — scheduled job entry point: evaluate every property for the
// previous calendar month.
export async function generateMonthlyInvoicesForAll(): Promise<{
  generated: number;
  skipped: number;
  properties: number;
}> {
  const period = previousMonthPeriod();
  const properties = await findPropertiesWithActiveLeases();
  let generated = 0;
  let skipped = 0;

  for (const { propertyId, landlordId } of properties) {
    const result = await generateInvoicesForProperty(landlordId, propertyId, period);
    generated += result.generated;
    skipped += result.skipped;
  }

  return { generated, skipped, properties: properties.length };
}

// US-INVOICE-02 / US-INVOICE-03 — view an invoice with role-based access.
export async function getInvoiceService(
  actorId: string,
  role: "Landlord" | "Tenant",
  invoiceId: string,
): Promise<InvoiceView> {
  const detail = await getInvoiceDetail(invoiceId);
  if (!detail) throw new NotFoundError("Invoice not found.");
  authorizeDetail(detail, actorId, role);
  const lineItems = await findInvoiceLineItems(invoiceId);
  return serializeInvoice(detail, lineItems);
}

// US-INVOICE-04 — review and send a draft invoice (Landlord only).
export async function sendInvoiceService(
  landlordId: string,
  invoiceId: string,
): Promise<InvoiceView> {
  const detail = await getInvoiceDetail(invoiceId);
  if (!detail) throw new NotFoundError("Invoice not found.");
  if (detail.landlordId !== landlordId) {
    throw new NotFoundError("Invoice not found.");
  }
  if (detail.status !== "Draft") {
    throw new UnprocessableError("Only a draft invoice can be sent.");
  }

  const sentAt = new Date();
  const updated = await updateInvoice(invoiceId, {
    status: "Sent",
    sentBy: landlordId,
    sentAt,
  });
  if (!updated) throw new NotFoundError("Invoice not found.");

  await writeAudit({
    actorUserId: landlordId,
    action: "invoice.sent",
    entityType: "invoices",
    entityId: invoiceId,
    afterValue: { status: "Sent", sentAt: sentAt.toISOString() },
  });

  await notifyTenantOfInvoice(
    detail.tenantUserId,
    invoiceId,
    detail.propertyName,
    detail.billingPeriod,
    String(detail.dueDate),
    detail.totalAmount,
  );

  const sentDetail = await getInvoiceDetail(invoiceId);
  if (!sentDetail) throw new NotFoundError("Invoice not found.");
  const lineItems = await findInvoiceLineItems(invoiceId);
  return serializeInvoice(sentDetail, lineItems);
}

// US-METER-03 — recompute a draft invoice's line items from corrected readings.
export async function recalculateDraftInvoice(
  roomId: string,
  billingPeriod: string,
  landlordId: string,
): Promise<void> {
  const invoice = await findActiveInvoiceForRoomPeriod(roomId, billingPeriod);
  if (!invoice || invoice.status !== "Draft") return;

  const bounds = periodBounds(billingPeriod);
  const ctx = await findActiveLeaseForRoomPeriod(roomId, bounds.start, bounds.end);
  if (!ctx) return;

  const water = await resolveWaterRate(ctx.propertyId, ctx.locality, bounds.end);
  const waterMethod = water.method!;
  const elec = await findActiveReading(roomId, "Electricity", billingPeriod);
  if (!elec) return;

  const waterReading =
    waterMethod === "Metered"
      ? await findActiveReading(roomId, "Water", billingPeriod)
      : null;

  const items = await buildLineItems(
    ctx,
    bounds.start,
    bounds.end,
    elec,
    waterReading,
    waterMethod,
    db,
  );
  const total = totalOf(items);

  await db.transaction(async (rawTrx) => {
    const trx = rawTrx as unknown as typeof db;
    await deleteInvoiceLineItems(invoice.id, trx);
    await insertInvoiceLineItems(
      items.map((i) => ({ ...i, invoiceId: invoice.id })),
      trx,
    );
    await updateInvoice(invoice.id, { totalAmount: total }, trx);
    await writeAudit(
      {
        actorUserId: landlordId,
        action: "invoice.recalculated",
        entityType: "invoices",
        entityId: invoice.id,
        afterValue: { totalAmount: total, lineItems: items.length },
      },
      trx,
    );
  });
}
