import { and, eq, isNull, lt, sql } from "drizzle-orm";
import { db, type Db } from "../../db/index.js";
import {
  invoices,
  leases,
  properties,
  rooms,
  tenantInfo,
} from "../../db/schema.js";

export type OutstandingInvoiceRow = {
  invoiceId: string;
  billingPeriod: string;
  totalAmount: number;
  dueDate: string;
  tenantFullName: string;
  roomName: string;
  propertyName: string;
};

// US-DASH-03 — outstanding + overdue invoices scoped to a landlord.
// Shared with future US-PAYMENT-03 (same underlying query).
export async function findOutstandingInvoicesForLandlord(
  landlordId: string,
  executor: Db = db,
): Promise<OutstandingInvoiceRow[]> {
  const rows = await executor
    .select({
      invoiceId: invoices.id,
      billingPeriod: invoices.billingPeriod,
      totalAmount: invoices.totalAmount,
      dueDate: invoices.dueDate,
      tenantFullName: tenantInfo.fullName,
      roomName: rooms.name,
      propertyName: properties.name,
    })
    .from(invoices)
    .innerJoin(leases, eq(invoices.leaseId, leases.id))
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .innerJoin(tenantInfo, eq(leases.tenantInfoId, tenantInfo.id))
    .where(
      and(
        isNull(invoices.deletedAt),
        isNull(properties.deletedAt),
        eq(properties.landlordId, landlordId),
        eq(invoices.status, "Sent"),
      ),
    )
    .orderBy(sql`${invoices.dueDate} asc`);
  return rows;
}

// US-DASH-03 helper — total outstanding amount for a landlord (point-in-time).
export async function sumOutstandingAmountForLandlord(
  landlordId: string,
  executor: Db = db,
): Promise<number> {
  const [row] = await executor
    .select({
      total: sql<number>`coalesce(sum(${invoices.totalAmount}), 0)`,
    })
    .from(invoices)
    .innerJoin(leases, eq(invoices.leaseId, leases.id))
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        isNull(invoices.deletedAt),
        isNull(properties.deletedAt),
        eq(properties.landlordId, landlordId),
        eq(invoices.status, "Sent"),
      ),
    );
  return Number(row?.total ?? 0);
}
