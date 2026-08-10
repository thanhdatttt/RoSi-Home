import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNull,
  sql,
} from "drizzle-orm";
import { db, type Db } from "../../db/index.js";
import {
  leases,
  maintenancePhotos,
  maintenanceRequests,
  maintenanceStatusHistory,
  properties,
  rooms,
  tenantInfo,
} from "../../db/schema.js";
import type { Pagination } from "../../lib/pagination.js";

export type MaintenanceRequestRow = typeof maintenanceRequests.$inferSelect;
export type MaintenancePhotoRow = typeof maintenancePhotos.$inferSelect;
export type MaintenanceStatusHistoryRow =
  typeof maintenanceStatusHistory.$inferSelect;
export type TenantMaintenanceRequestRow = MaintenanceRequestRow & {
  roomName: string;
};
export type LandlordMaintenanceRequestRow = MaintenanceRequestRow & {
  propertyId: string;
  propertyName: string;
  roomName: string;
  tenantFullName: string;
  tenantUserId: string | null;
};
export type RoomMaintenanceRequestRow = MaintenanceRequestRow & {
  tenantFullName: string;
};
export type MaintenanceRoomContext = {
  id: string;
  name: string;
  propertyId: string;
};
export type LandlordMaintenanceRequestFilters = {
  propertyId?: string;
  status?: MaintenanceRequestRow["status"];
};

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

function tenantRequestBaseQuery(executor: Db) {
  return executor
    .select({
      ...getTableColumns(maintenanceRequests),
      roomName: rooms.name,
    })
    .from(maintenanceRequests)
    .innerJoin(tenantInfo, eq(maintenanceRequests.tenantInfoId, tenantInfo.id))
    .innerJoin(rooms, eq(maintenanceRequests.roomId, rooms.id));
}

function tenantRequestScope(tenantUserId: string) {
  return and(
    eq(tenantInfo.userId, tenantUserId),
    isNull(tenantInfo.deletedAt),
    isNull(maintenanceRequests.deletedAt),
  );
}

export async function listMaintenanceRequestsForTenantUser(
  tenantUserId: string,
  pagination: Pagination,
  executor: Db = db,
): Promise<TenantMaintenanceRequestRow[]> {
  const rows = await tenantRequestBaseQuery(executor)
    .where(tenantRequestScope(tenantUserId))
    .orderBy(desc(maintenanceRequests.submittedAt), desc(maintenanceRequests.id))
    .limit(pagination.pageSize)
    .offset((pagination.page - 1) * pagination.pageSize);
  return rows as TenantMaintenanceRequestRow[];
}

export async function countMaintenanceRequestsForTenantUser(
  tenantUserId: string,
  executor: Db = db,
): Promise<number> {
  const [row] = await executor
    .select({ value: count() })
    .from(maintenanceRequests)
    .innerJoin(tenantInfo, eq(maintenanceRequests.tenantInfoId, tenantInfo.id))
    .where(tenantRequestScope(tenantUserId));
  return Number(row?.value ?? 0);
}

export async function findMaintenanceRequestForTenantUser(
  tenantUserId: string,
  requestId: string,
  executor: Db = db,
): Promise<TenantMaintenanceRequestRow | null> {
  const [row] = await tenantRequestBaseQuery(executor).where(
    and(
      tenantRequestScope(tenantUserId),
      eq(maintenanceRequests.id, requestId),
    ),
  );
  return (row as TenantMaintenanceRequestRow | undefined) ?? null;
}

function landlordRequestBaseQuery(executor: Db) {
  return executor
    .select({
      ...getTableColumns(maintenanceRequests),
      propertyId: properties.id,
      propertyName: properties.name,
      roomName: rooms.name,
      tenantFullName: tenantInfo.fullName,
      tenantUserId: tenantInfo.userId,
    })
    .from(maintenanceRequests)
    .innerJoin(tenantInfo, eq(maintenanceRequests.tenantInfoId, tenantInfo.id))
    .innerJoin(rooms, eq(maintenanceRequests.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id));
}

function landlordRequestScope(
  landlordId: string,
  filters: LandlordMaintenanceRequestFilters,
) {
  return and(
    eq(properties.landlordId, landlordId),
    filters.propertyId ? eq(properties.id, filters.propertyId) : undefined,
    filters.status ? eq(maintenanceRequests.status, filters.status) : undefined,
    isNull(maintenanceRequests.deletedAt),
    isNull(tenantInfo.deletedAt),
    isNull(rooms.deletedAt),
    isNull(properties.deletedAt),
  );
}

export async function listMaintenanceRequestsForLandlord(
  landlordId: string,
  pagination: Pagination,
  filters: LandlordMaintenanceRequestFilters = {},
  executor: Db = db,
): Promise<LandlordMaintenanceRequestRow[]> {
  const rows = await landlordRequestBaseQuery(executor)
    .where(landlordRequestScope(landlordId, filters))
    .orderBy(desc(maintenanceRequests.submittedAt), desc(maintenanceRequests.id))
    .limit(pagination.pageSize)
    .offset((pagination.page - 1) * pagination.pageSize);
  return rows as LandlordMaintenanceRequestRow[];
}

export async function countMaintenanceRequestsForLandlord(
  landlordId: string,
  filters: LandlordMaintenanceRequestFilters = {},
  executor: Db = db,
): Promise<number> {
  const [row] = await executor
    .select({ value: count() })
    .from(maintenanceRequests)
    .innerJoin(tenantInfo, eq(maintenanceRequests.tenantInfoId, tenantInfo.id))
    .innerJoin(rooms, eq(maintenanceRequests.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(landlordRequestScope(landlordId, filters));
  return Number(row?.value ?? 0);
}

export async function findMaintenanceRequestForLandlord(
  landlordId: string,
  requestId: string,
  executor: Db = db,
): Promise<LandlordMaintenanceRequestRow | null> {
  const [row] = await landlordRequestBaseQuery(executor).where(
    and(
      landlordRequestScope(landlordId, {}),
      eq(maintenanceRequests.id, requestId),
    ),
  );
  return (row as LandlordMaintenanceRequestRow | undefined) ?? null;
}

export async function findOwnedMaintenanceRoom(
  landlordId: string,
  roomId: string,
  executor: Db = db,
): Promise<MaintenanceRoomContext | null> {
  const [row] = await executor
    .select({
      id: rooms.id,
      name: rooms.name,
      propertyId: properties.id,
    })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        eq(rooms.id, roomId),
        eq(properties.landlordId, landlordId),
        isNull(rooms.deletedAt),
        isNull(properties.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

function roomMaintenanceHistoryScope(landlordId: string, roomId: string) {
  return and(
    eq(maintenanceRequests.roomId, roomId),
    eq(properties.landlordId, landlordId),
    isNull(maintenanceRequests.deletedAt),
    isNull(rooms.deletedAt),
    isNull(properties.deletedAt),
  );
}

export async function listMaintenanceRequestsForOwnedRoom(
  landlordId: string,
  roomId: string,
  pagination: Pagination,
  executor: Db = db,
): Promise<RoomMaintenanceRequestRow[]> {
  const rows = await executor
    .select({
      ...getTableColumns(maintenanceRequests),
      tenantFullName: tenantInfo.fullName,
    })
    .from(maintenanceRequests)
    .innerJoin(tenantInfo, eq(maintenanceRequests.tenantInfoId, tenantInfo.id))
    .innerJoin(rooms, eq(maintenanceRequests.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(roomMaintenanceHistoryScope(landlordId, roomId))
    .orderBy(desc(maintenanceRequests.submittedAt), desc(maintenanceRequests.id))
    .limit(pagination.pageSize)
    .offset((pagination.page - 1) * pagination.pageSize);
  return rows as RoomMaintenanceRequestRow[];
}

export async function countMaintenanceRequestsForOwnedRoom(
  landlordId: string,
  roomId: string,
  executor: Db = db,
): Promise<number> {
  const [row] = await executor
    .select({ value: count() })
    .from(maintenanceRequests)
    .innerJoin(rooms, eq(maintenanceRequests.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(roomMaintenanceHistoryScope(landlordId, roomId));
  return Number(row?.value ?? 0);
}

export async function findMaintenanceStatusHistoryByRequestIds(
  requestIds: readonly string[],
  executor: Db = db,
): Promise<MaintenanceStatusHistoryRow[]> {
  if (requestIds.length === 0) return [];
  return executor
    .select()
    .from(maintenanceStatusHistory)
    .where(inArray(maintenanceStatusHistory.requestId, [...requestIds]))
    .orderBy(
      asc(maintenanceStatusHistory.changedAt),
      asc(maintenanceStatusHistory.id),
    );
}

export async function findMaintenancePhotosByRequestIds(
  requestIds: readonly string[],
  executor: Db = db,
): Promise<MaintenancePhotoRow[]> {
  if (requestIds.length === 0) return [];
  return executor
    .select()
    .from(maintenancePhotos)
    .where(inArray(maintenancePhotos.requestId, [...requestIds]))
    .orderBy(asc(maintenancePhotos.requestId), asc(maintenancePhotos.id));
}

export async function updateMaintenanceRequestStatus(
  input: {
    requestId: string;
    fromStatus: MaintenanceRequestRow["status"];
    toStatus: MaintenanceRequestRow["status"];
    completedAt: Date | null;
    changedAt: Date;
  },
  executor: Db = db,
): Promise<MaintenanceRequestRow | null> {
  const [row] = await executor
    .update(maintenanceRequests)
    .set({
      status: input.toStatus,
      completedAt: input.completedAt,
      updatedAt: input.changedAt,
    })
    .where(
      and(
        eq(maintenanceRequests.id, input.requestId),
        eq(maintenanceRequests.status, input.fromStatus),
        isNull(maintenanceRequests.deletedAt),
      ),
    )
    .returning();
  return row ?? null;
}

export async function insertMaintenanceStatusHistory(
  input: {
    requestId: string;
    fromStatus: MaintenanceRequestRow["status"];
    toStatus: MaintenanceRequestRow["status"];
    changedBy: string;
    changedAt: Date;
  },
  executor: Db = db,
): Promise<MaintenanceStatusHistoryRow> {
  const [row] = await executor
    .insert(maintenanceStatusHistory)
    .values(input)
    .returning();
  return row;
}
