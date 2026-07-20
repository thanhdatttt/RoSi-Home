import { and, asc, desc, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import { db, type Db } from "../../db/index.js";
import {
  leaseReminderConfigs,
  leases,
  properties,
  rooms,
  tenantInfo,
  users,
} from "../../db/schema.js";
import { NotFoundError } from "../../lib/errors.js";
import type { Pagination } from "../../lib/pagination.js";

export type LeaseRow = typeof leases.$inferSelect;
export type TenantInfoRow = typeof tenantInfo.$inferSelect;
export type LeaseReminderConfigRow = typeof leaseReminderConfigs.$inferSelect;

export type LeaseDetailRow = LeaseRow & {
  roomName: string;
  propertyId: string;
  propertyName: string;
  tenantFullName: string;
  tenantPhone: string;
  tenantEmail: string;
  tenantUserId: string | null;
};

function detailSelection() {
  return {
    ...getTableColumns(leases),
    roomName: rooms.name,
    propertyId: properties.id,
    propertyName: properties.name,
    tenantFullName: tenantInfo.fullName,
    tenantPhone: tenantInfo.phone,
    tenantEmail: tenantInfo.email,
    tenantUserId: tenantInfo.userId,
  };
}

function detailBaseQuery(executor: Db) {
  return executor
    .select(detailSelection())
    .from(leases)
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .innerJoin(tenantInfo, eq(leases.tenantInfoId, tenantInfo.id));
}

// --- Ownership -------------------------------------------------------------

export async function assertRoomOwnedByLandlord(
  roomId: string,
  landlordId: string,
  executor: Db = db,
): Promise<{ id: string; propertyId: string }> {
  const [row] = await executor
    .select({ id: rooms.id, propertyId: rooms.propertyId })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        eq(rooms.id, roomId),
        isNull(rooms.deletedAt),
        eq(properties.landlordId, landlordId),
        isNull(properties.deletedAt),
      ),
    );
  if (!row) throw new NotFoundError("Room not found.");
  return row;
}

export async function assertPropertyOwnedByLandlord(
  propertyId: string,
  landlordId: string,
  executor: Db = db,
): Promise<void> {
  const [row] = await executor
    .select({ id: properties.id })
    .from(properties)
    .where(
      and(
        eq(properties.id, propertyId),
        eq(properties.landlordId, landlordId),
        isNull(properties.deletedAt),
      ),
    );
  if (!row) throw new NotFoundError("Property not found.");
}

// --- Tenant matching / dedup (US-LEASE-01 rule #2) --------------------------

export async function findActiveTenantByIdNumber(
  idNumber: string,
  executor: Db = db,
): Promise<TenantInfoRow | null> {
  const [row] = await executor
    .select()
    .from(tenantInfo)
    .where(and(eq(tenantInfo.idNumber, idNumber), isNull(tenantInfo.deletedAt)));
  return row ?? null;
}

export async function findConflictingTenantField(
  field: "phone" | "email",
  value: string,
  excludeTenantId: string | null,
  executor: Db = db,
): Promise<boolean> {
  const column = field === "phone" ? tenantInfo.phone : tenantInfo.email;
  const conditions = [eq(column, value), isNull(tenantInfo.deletedAt)];
  if (excludeTenantId) conditions.push(sql`${tenantInfo.id} <> ${excludeTenantId}`);
  const [row] = await executor
    .select({ id: tenantInfo.id })
    .from(tenantInfo)
    .where(and(...conditions));
  return !!row;
}

export async function findConflictingUsername(
  phone: string,
  excludeUserId: string | null,
  executor: Db = db,
): Promise<boolean> {
  const conditions = [eq(users.username, phone)];
  if (excludeUserId) conditions.push(sql`${users.id} <> ${excludeUserId}`);
  const [row] = await executor.select({ id: users.id }).from(users).where(and(...conditions));
  return !!row;
}

export async function createTenantInfo(
  landlordId: string,
  tenant: { fullName: string; phone: string; email: string; idNumber: string },
  executor: Db = db,
): Promise<TenantInfoRow> {
  const [row] = await executor
    .insert(tenantInfo)
    .values({ ...tenant, createdByLandlordId: landlordId })
    .returning();
  return row;
}

// --- Overlap guard -----------------------------------------------------------

// Advisory lock scoped to the room so two concurrent lease-creation/renewal
// requests for the same room can't both pass the overlap check before either
// commits (architecture §4.4 — this is "the highest-risk transaction").
export async function lockRoomForLeaseWrite(roomId: string, executor: Db): Promise<void> {
  await executor.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${roomId}, 1))`);
}

export async function findActiveLeasesForRoom(
  roomId: string,
  executor: Db = db,
  excludeLeaseId?: string,
): Promise<LeaseRow[]> {
  const conditions = [eq(leases.roomId, roomId), eq(leases.status, "Active"), isNull(leases.deletedAt)];
  if (excludeLeaseId) conditions.push(sql`${leases.id} <> ${excludeLeaseId}`);
  return executor.select().from(leases).where(and(...conditions));
}

// --- CRUD --------------------------------------------------------------------

export async function insertLease(
  input: {
    roomId: string;
    tenantInfoId: string;
    startDate: string;
    endDate: string;
    agreedRent: number;
    deposit: number;
    createdBy: string;
  },
  executor: Db = db,
): Promise<LeaseRow> {
  const [row] = await executor.insert(leases).values(input).returning();
  return row;
}

export async function findLeaseForLandlord(
  landlordId: string,
  leaseId: string,
  executor: Db = db,
): Promise<LeaseDetailRow | null> {
  const [row] = await detailBaseQuery(executor).where(
    and(
      eq(leases.id, leaseId),
      isNull(leases.deletedAt),
      eq(properties.landlordId, landlordId),
      isNull(properties.deletedAt),
    ),
  );
  return (row as LeaseDetailRow) ?? null;
}

export async function findLeaseForTenantUser(
  tenantUserId: string,
  leaseId: string,
  executor: Db = db,
): Promise<LeaseDetailRow | null> {
  const [row] = await detailBaseQuery(executor).where(
    and(eq(leases.id, leaseId), isNull(leases.deletedAt), eq(tenantInfo.userId, tenantUserId)),
  );
  console.log(row);
  return (row as LeaseDetailRow) ?? null;
}

export async function listLeasesForLandlord(
  landlordId: string,
  p: Pagination,
  propertyId: string | undefined,
  executor: Db = db,
): Promise<LeaseDetailRow[]> {
  const conditions = [
    isNull(leases.deletedAt),
    eq(properties.landlordId, landlordId),
    isNull(properties.deletedAt),
  ];
  if (propertyId) conditions.push(eq(properties.id, propertyId));
  const rows = await detailBaseQuery(executor)
    .where(and(...conditions))
    .orderBy(desc(leases.createdAt))
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);
  return rows as LeaseDetailRow[];
}

export async function countLeasesForLandlord(
  landlordId: string,
  propertyId: string | undefined,
  executor: Db = db,
): Promise<number> {
  const conditions = [
    isNull(leases.deletedAt),
    eq(properties.landlordId, landlordId),
    isNull(properties.deletedAt),
  ];
  if (propertyId) conditions.push(eq(properties.id, propertyId));
  const [row] = await executor
    .select({ value: sql<number>`count(*)` })
    .from(leases)
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(and(...conditions));
  return Number(row?.value ?? 0);
}

export async function listLeasesForTenantUser(
  tenantUserId: string,
  p: Pagination,
  executor: Db = db,
): Promise<LeaseDetailRow[]> {
  const rows = await detailBaseQuery(executor)
    .where(and(isNull(leases.deletedAt), eq(tenantInfo.userId, tenantUserId)))
    .orderBy(desc(leases.createdAt))
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);
  return rows as LeaseDetailRow[];
}

export async function countLeasesForTenantUser(
  tenantUserId: string,
  executor: Db = db,
): Promise<number> {
  const [row] = await executor
    .select({ value: sql<number>`count(*)` })
    .from(leases)
    .innerJoin(tenantInfo, eq(leases.tenantInfoId, tenantInfo.id))
    .where(and(isNull(leases.deletedAt), eq(tenantInfo.userId, tenantUserId)));
  return Number(row?.value ?? 0);
}

export async function updateLeaseRow(
  id: string,
  fields: Partial<Pick<LeaseRow, "endDate" | "agreedRent" | "deposit">>,
  executor: Db = db,
): Promise<LeaseRow | null> {
  const [row] = await executor
    .update(leases)
    .set({ ...fields, updatedAt: new Date() })
    .where(and(eq(leases.id, id), isNull(leases.deletedAt)))
    .returning();
  return row ?? null;
}

export async function endLeaseRow(
  id: string,
  endedBy: string,
  actualEndDate: string,
  status: "Ended",
  executor: Db = db,
): Promise<LeaseRow | null> {
  const [row] = await executor
    .update(leases)
    .set({
      status,
      actualEndDate,
      endedBy,
      endedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(leases.id, id), isNull(leases.deletedAt)))
    .returning();
  return row ?? null;
}

// --- Upcoming expirations (US-LEASE-06, shared with future US-DASH-04) -------

export async function findUpcomingExpirationsForLandlord(
  landlordId: string,
  todayStr: string,
  untilStr: string,
  executor: Db = db,
): Promise<LeaseDetailRow[]> {
  const rows = await detailBaseQuery(executor)
    .where(
      and(
        isNull(leases.deletedAt),
        eq(leases.status, "Active"),
        eq(properties.landlordId, landlordId),
        isNull(properties.deletedAt),
        sql`${leases.endDate} >= ${todayStr}`,
        sql`${leases.endDate} <= ${untilStr}`,
      ),
    )
    .orderBy(asc(leases.endDate));
  return rows as LeaseDetailRow[];
}

// --- Lease reminder config (US-LEASE-05) -------------------------------------

export async function findLeaseReminderConfig(
  propertyId: string,
  executor: Db = db,
): Promise<LeaseReminderConfigRow | null> {
  const [row] = await executor
    .select()
    .from(leaseReminderConfigs)
    .where(eq(leaseReminderConfigs.propertyId, propertyId));
  return row ?? null;
}

export async function upsertLeaseReminderConfig(
  propertyId: string,
  fields: Partial<Pick<LeaseReminderConfigRow, "remindAt30Days" | "remindAt15Days" | "remindAt7Days">>,
  executor: Db = db,
): Promise<LeaseReminderConfigRow> {
  const existing = await findLeaseReminderConfig(propertyId, executor);
  if (existing) {
    const [row] = await executor
      .update(leaseReminderConfigs)
      .set(fields)
      .where(eq(leaseReminderConfigs.propertyId, propertyId))
      .returning();
    return row;
  }
  const [row] = await executor
    .insert(leaseReminderConfigs)
    .values({ propertyId, ...fields })
    .returning();
  return row;
}

// For the daily sendLeaseExpirationReminders job: every property that has at
// least one reminder flag enabled, with its enabled offsets.
export async function listEnabledReminderConfigs(
  executor: Db = db,
): Promise<LeaseReminderConfigRow[]> {
  return executor
    .select()
    .from(leaseReminderConfigs)
    .where(
      sql`${leaseReminderConfigs.remindAt30Days} = true OR ${leaseReminderConfigs.remindAt15Days} = true OR ${leaseReminderConfigs.remindAt7Days} = true`,
    );
}

// Active leases in a given property whose endDate falls exactly on a target
// date, joined with the owning landlord and assigned tenant's user account
// (only tenants with a provisioned account can receive a push).
export async function findActiveLeasesEndingOn(
  propertyId: string,
  targetDate: string,
  executor: Db = db,
): Promise<
  {
    leaseId: string;
    roomName: string;
    landlordId: string;
    tenantUserId: string | null;
  }[]
> {
  const rows = await executor
    .select({
      leaseId: leases.id,
      roomName: rooms.name,
      landlordId: properties.landlordId,
      tenantUserId: tenantInfo.userId,
    })
    .from(leases)
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .innerJoin(tenantInfo, eq(leases.tenantInfoId, tenantInfo.id))
    .where(
      and(
        eq(rooms.propertyId, propertyId),
        eq(leases.status, "Active"),
        isNull(leases.deletedAt),
        eq(leases.endDate, targetDate),
      ),
    );
  return rows;
}
