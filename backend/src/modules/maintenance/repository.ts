import { and, eq, isNull, sql } from "drizzle-orm";
import { db, type Db } from "../../db/index.js";
import {
  leases,
  maintenancePhotos,
  maintenanceRequests,
  properties,
  rooms,
  tenantInfo,
} from "../../db/schema.js";

export type MaintenanceRequestRow = typeof maintenanceRequests.$inferSelect;
export type MaintenancePhotoRow = typeof maintenancePhotos.$inferSelect;

export type ActiveMaintenanceLeaseContext = {
  tenantInfoId: string;
  landlordId: string;
  roomName: string;
};

export async function findActiveLeaseForTenantRoom(
  tenantUserId: string,
  roomId: string,
  executor: Db = db,
): Promise<ActiveMaintenanceLeaseContext | null> {
  const [row] = await executor
    .select({
      tenantInfoId: tenantInfo.id,
      landlordId: properties.landlordId,
      roomName: rooms.name,
    })
    .from(leases)
    .innerJoin(tenantInfo, eq(leases.tenantInfoId, tenantInfo.id))
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        eq(leases.roomId, roomId),
        eq(tenantInfo.userId, tenantUserId),
        eq(leases.status, "Active"),
        isNull(leases.deletedAt),
        isNull(tenantInfo.deletedAt),
        isNull(rooms.deletedAt),
        isNull(properties.deletedAt),
        sql`${leases.startDate} <= CURRENT_DATE`,
        sql`${leases.endDate} >= CURRENT_DATE`,
        sql`(${leases.actualEndDate} IS NULL OR ${leases.actualEndDate} >= CURRENT_DATE)`,
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function insertMaintenanceRequest(
  input: {
    id: string;
    roomId: string;
    tenantInfoId: string;
    title: string;
    description: string;
    status: "Pending";
  },
  executor: Db = db,
): Promise<MaintenanceRequestRow> {
  const [row] = await executor
    .insert(maintenanceRequests)
    .values(input)
    .returning();
  return row;
}

export async function insertMaintenancePhotos(
  input: { id: string; requestId: string; fileUrl: string }[],
  executor: Db = db,
): Promise<MaintenancePhotoRow[]> {
  if (input.length === 0) return [];
  return executor.insert(maintenancePhotos).values(input).returning();
}
