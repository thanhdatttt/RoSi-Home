import { and, asc, count, desc, eq, isNull, lte, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { leases, properties, rooms, tenantInfo } from "../../db/schema.js";

// Read-only lease helpers. Lease *creation* (US-LEASE-01) is implemented
// elsewhere; the billing/invoice stories only need to read active lease data:
// the lease linked to a room in a billing period, its tenant, rent, and the
// property context required for ownership and rate resolution.

export type ActiveLeaseContext = {
  leaseId: string;
  roomId: string;
  propertyId: string;
  locality: string | null;
  tenantInfoId: string;
  tenantUserId: string | null;
  agreedRent: number;
};

export type LeaseRow = typeof leases.$inferSelect;

function activeDuring(periodStart: string, periodEnd: string) {
  // Active iff not soft-deleted, status Active, started on/before period end,
  // and not yet ended before the period start.
  return and(
    isNull(leases.deletedAt),
    eq(leases.status, "Active"),
    lte(leases.startDate, periodEnd),
    sql`(${leases.actualEndDate} IS NULL OR ${leases.actualEndDate} >= ${periodStart})`,
  );
}

export async function findActiveLeaseForRoomPeriod(
  roomId: string,
  periodStart: string,
  periodEnd: string,
): Promise<ActiveLeaseContext | null> {
  const [row] = await db
    .select({
      leaseId: leases.id,
      roomId: leases.roomId,
      propertyId: rooms.propertyId,
      locality: properties.locality,
      tenantInfoId: leases.tenantInfoId,
      tenantUserId: tenantInfo.userId,
      agreedRent: leases.agreedRent,
    })
    .from(leases)
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .innerJoin(tenantInfo, eq(leases.tenantInfoId, tenantInfo.id))
    .where(and(eq(leases.roomId, roomId), activeDuring(periodStart, periodEnd)))
    .orderBy(desc(leases.startDate))
    .limit(1);
  return row ?? null;
}

export async function countActiveLeasesForRoomPeriod(
  roomId: string,
  periodStart: string,
  periodEnd: string,
  executor: typeof db = db,
): Promise<number> {
  const [row] = await executor
    .select({ value: count() })
    .from(leases)
    .where(and(eq(leases.roomId, roomId), activeDuring(periodStart, periodEnd)));
  return Number(row?.value ?? 0);
}

// All rooms with an active lease in the property during the period. Used by the
// monthly generation job to evaluate every billable room once.
export async function findActiveLeasesForPropertyPeriod(
  propertyId: string,
  periodStart: string,
  periodEnd: string,
): Promise<ActiveLeaseContext[]> {
  return db
    .select({
      leaseId: leases.id,
      roomId: leases.roomId,
      propertyId: rooms.propertyId,
      locality: properties.locality,
      tenantInfoId: leases.tenantInfoId,
      tenantUserId: tenantInfo.userId,
      agreedRent: leases.agreedRent,
    })
    .from(leases)
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .innerJoin(tenantInfo, eq(leases.tenantInfoId, tenantInfo.id))
    .where(
      and(
        eq(rooms.propertyId, propertyId),
        isNull(rooms.deletedAt),
        isNull(properties.deletedAt),
        activeDuring(periodStart, periodEnd),
      ),
    )
    .orderBy(asc(rooms.name), desc(leases.startDate));
}

// All properties that have at least one active lease, for the scheduled job.
export async function findPropertiesWithActiveLeases(): Promise<
  { propertyId: string; landlordId: string }[]
> {
  return db
    .selectDistinct({
      propertyId: rooms.propertyId,
      landlordId: properties.landlordId,
    })
    .from(leases)
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        isNull(leases.deletedAt),
        eq(leases.status, "Active"),
        isNull(rooms.deletedAt),
        isNull(properties.deletedAt),
      ),
    );
}
