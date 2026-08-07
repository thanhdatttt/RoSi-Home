import { and, eq, isNull, lt, sql, inArray } from "drizzle-orm";
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
        inArray(invoices.status, ["Sent", "Draft"]),
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

// TENANT DASHBOARD REPOSITORY

export type ActiveTenantLeaseRow = {
  leaseId: string;
  propertyName: string;
  roomName: string;
  startDate: string;
  endDate: string;
  agreedRent: number;
  deposit: number;
  status: string;
};

export async function findActiveLeaseForTenantUser(
  userId: string,
  executor: Db = db,
): Promise<ActiveTenantLeaseRow | null> {
  const [row] = await executor
    .select({
      leaseId: leases.id,
      propertyName: properties.name,
      roomName: rooms.name,
      startDate: leases.startDate,
      endDate: leases.endDate,
      agreedRent: leases.agreedRent,
      deposit: leases.deposit,
      status: leases.status,
    })
    .from(leases)
    .innerJoin(tenantInfo, eq(leases.tenantInfoId, tenantInfo.id))
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        eq(tenantInfo.userId, userId),
        eq(leases.status, "Active"),
        isNull(leases.deletedAt),
        isNull(rooms.deletedAt),
        isNull(properties.deletedAt),
      )
    );
  
  return row ?? null;
}

export type NextPaymentRow = {
  invoiceId: string;
  amount: number;
  dueDate: string;
};

export async function findNextPaymentDueForLease(
  leaseId: string,
  executor: Db = db,
): Promise<NextPaymentRow | null> {
  const [row] = await executor
    .select({
      invoiceId: invoices.id,
      amount: invoices.totalAmount,
      dueDate: invoices.dueDate,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.leaseId, leaseId),
        eq(invoices.status, "Sent"),
        isNull(invoices.deletedAt),
      )
    )
    .orderBy(sql`${invoices.dueDate} asc`)
    .limit(1);

  return row ?? null;
}

// US-DASH-01
export async function getOccupiedRoomCount(landlordId: string, executor: Db = db) {
  const [totalRow] = await executor
    .select({
      totalRooms: sql<number>`count(distinct ${rooms.id})`
    })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        isNull(rooms.deletedAt),
        isNull(properties.deletedAt),
        eq(properties.landlordId, landlordId)
      )
    );

  const [occupiedRow] = await executor
    .select({
      occupiedRooms: sql<number>`count(distinct ${rooms.id})`
    })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .innerJoin(leases, eq(leases.roomId, rooms.id))
    .where(
      and(
        isNull(rooms.deletedAt),
        isNull(properties.deletedAt),
        eq(properties.landlordId, landlordId),
        eq(leases.status, "Active")
      )
    );

  return {
    totalRooms: Number(totalRow?.totalRooms ?? 0),
    occupiedRooms: Number(occupiedRow?.occupiedRooms ?? 0),
  };
}
