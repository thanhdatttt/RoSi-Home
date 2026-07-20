import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  invoiceGenerationSkips,
  invoiceLineItems,
  invoices,
  leases,
  properties,
  rooms,
  surcharges,
  tenantInfo,
} from "../../db/schema.js";
import { getTableColumns } from "drizzle-orm";
import { findProperty, type PropertyRow } from "../properties/repository.js";
import type { SurchargeRow } from "../charges/repository.js";
import { NotFoundError } from "../../lib/errors.js";

export type InvoiceRow = typeof invoices.$inferSelect;
export type InvoiceLineItemRow = typeof invoiceLineItems.$inferSelect;
export type NewInvoiceLineItem = typeof invoiceLineItems.$inferInsert;

// Rich invoice row for authorization and rendering: joins the lease, room,
// property (for landlord ownership), and tenant (for tenant access).
export type InvoiceDetail = InvoiceRow & {
  tenantInfoId: string;
  agreedRent: number;
  propertyId: string;
  landlordId: string;
  locality: string | null;
  propertyName: string;
  propertyAddress: string;
  tenantUserId: string | null;
  tenantFullName: string;
  tenantEmail: string;
  tenantPhone: string;
};

export async function assertPropertyOwned(
  propertyId: string,
  landlordId: string,
): Promise<PropertyRow> {
  const prop = await findProperty(landlordId, propertyId);
  if (!prop) throw new NotFoundError("Property not found.");
  return prop;
}

export async function findActiveInvoiceForRoomPeriod(
  roomId: string,
  billingPeriod: string,
  executor: typeof db = db,
): Promise<InvoiceRow | null> {
  const [row] = await executor
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.roomId, roomId),
        eq(invoices.billingPeriod, billingPeriod),
        isNull(invoices.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function findExistingInvoice(
  leaseId: string,
  billingPeriod: string,
  executor: typeof db = db,
): Promise<InvoiceRow | null> {
  const [row] = await executor
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.leaseId, leaseId),
        eq(invoices.billingPeriod, billingPeriod),
        isNull(invoices.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getInvoiceDetail(
  id: string,
  executor: typeof db = db,
): Promise<InvoiceDetail | null> {
  const [row] = await executor
    .select({
      ...getTableColumns(invoices),
      tenantInfoId: leases.tenantInfoId,
      agreedRent: leases.agreedRent,
      propertyId: properties.id,
      landlordId: properties.landlordId,
      locality: properties.locality,
      propertyName: properties.name,
      propertyAddress: properties.address,
      tenantUserId: tenantInfo.userId,
      tenantFullName: tenantInfo.fullName,
      tenantEmail: tenantInfo.email,
      tenantPhone: tenantInfo.phone,
    })
    .from(invoices)
    .innerJoin(leases, eq(invoices.leaseId, leases.id))
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .innerJoin(tenantInfo, eq(leases.tenantInfoId, tenantInfo.id))
    .where(and(eq(invoices.id, id), isNull(invoices.deletedAt)))
    .limit(1);
  return (row ?? null) as InvoiceDetail | null;
}

export async function findInvoiceLineItems(
  invoiceId: string,
  executor: typeof db = db,
): Promise<InvoiceLineItemRow[]> {
  return executor
    .select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, invoiceId))
    .orderBy(sql`${invoiceLineItems.type}`);
}

export async function findActiveSurchargesForPropertyPeriod(
  propertyId: string,
  periodStart: string,
  periodEnd: string,
  executor: typeof db = db,
): Promise<SurchargeRow[]> {
  return executor
    .select()
    .from(surcharges)
    .where(
      and(
        eq(surcharges.propertyId, propertyId),
        eq(surcharges.active, true),
        isNull(surcharges.deletedAt),
        sql`${surcharges.effectiveFrom} <= ${periodEnd}`,
        sql`(${surcharges.effectiveTo} IS NULL OR ${surcharges.effectiveTo} >= ${periodStart})`,
      ),
    );
}

export async function createInvoiceWithLineItems(
  invoiceValues: typeof invoices.$inferInsert,
  lineItems: Omit<NewInvoiceLineItem, "invoiceId">[],
  executor: typeof db = db,
): Promise<InvoiceRow> {
  const [invoice] = await executor
    .insert(invoices)
    .values(invoiceValues)
    .returning();
  if (lineItems.length > 0) {
    await executor
      .insert(invoiceLineItems)
      .values(lineItems.map((li) => ({ ...li, invoiceId: invoice.id })));
  }
  return invoice;
}

export async function createInvoiceGenerationSkip(
  leaseId: string,
  billingPeriod: string,
  reason: string,
  executor: typeof db = db,
): Promise<void> {
  await executor
    .insert(invoiceGenerationSkips)
    .values({ leaseId, billingPeriod, reason });
}

export async function updateInvoice(
  id: string,
  fields: Partial<typeof invoices.$inferInsert>,
  executor: typeof db = db,
): Promise<InvoiceRow | null> {
  const [row] = await executor
    .update(invoices)
    .set({ ...fields, updatedAt: new Date() })
    .where(and(eq(invoices.id, id), isNull(invoices.deletedAt)))
    .returning();
  return row ?? null;
}

export async function deleteInvoiceLineItems(
  invoiceId: string,
  executor: typeof db = db,
): Promise<void> {
  await executor
    .delete(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, invoiceId));
}

export async function insertInvoiceLineItems(
  items: NewInvoiceLineItem[],
  executor: typeof db = db,
): Promise<void> {
  if (items.length === 0) return;
  await executor.insert(invoiceLineItems).values(items);
}
