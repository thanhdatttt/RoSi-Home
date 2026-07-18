import { and, asc, count, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { leases, rooms } from "../../db/schema.js";
import type { Pagination } from "../../lib/pagination.js";
import type { CreateRoomInput } from "./schema.js";

export type RoomRow = typeof rooms.$inferSelect;
export type RoomWithStatus = RoomRow & { status: "Vacant" | "Occupied" };

// Occupancy is derived, never stored (architecture §4.6). A room is Occupied
// iff it has an Active, non-soft-deleted lease.
export const roomStatusExpr = sql`
  CASE
    WHEN EXISTS (
      SELECT 1 FROM ${leases} l
      WHERE l.room_id = ${rooms.id}
        AND l.status = 'Active'
        AND l.deleted_at IS NULL
    ) THEN 'Occupied'::text
    ELSE 'Vacant'::text
  END`;

export async function createRoom(
  propertyId: string,
  input: CreateRoomInput,
): Promise<RoomRow> {
  const [row] = await db
    .insert(rooms)
    .values({ propertyId, name: input.name, baseRent: input.baseRent })
    .returning();
  return row;
}

export async function countRoomsByProperty(propertyId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(rooms)
    .where(and(eq(rooms.propertyId, propertyId), isNull(rooms.deletedAt)));
  return Number(row?.value ?? 0);
}

export async function listRoomsByProperty(
  propertyId: string,
  p: Pagination,
): Promise<RoomWithStatus[]> {
  const rows = await db
    .select({ ...getTableColumns(rooms), status: roomStatusExpr })
    .from(rooms)
    .where(and(eq(rooms.propertyId, propertyId), isNull(rooms.deletedAt)))
    .orderBy(asc(rooms.name))
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);
  return rows as unknown as RoomWithStatus[];
}

export async function findActiveRoom(id: string): Promise<RoomRow | null> {
  const [row] = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.id, id), isNull(rooms.deletedAt)));
  return row ?? null;
}

export async function findActiveRoomWithStatus(
  id: string,
): Promise<RoomWithStatus | null> {
  const [row] = await db
    .select({ ...getTableColumns(rooms), status: roomStatusExpr })
    .from(rooms)
    .where(and(eq(rooms.id, id), isNull(rooms.deletedAt)));
  return (row ?? null) as unknown as RoomWithStatus | null;
}

export async function updateRoom(
  id: string,
  input: Partial<CreateRoomInput>,
): Promise<RoomRow | null> {
  const [row] = await db
    .update(rooms)
    .set(input)
    .where(and(eq(rooms.id, id), isNull(rooms.deletedAt)))
    .returning();
  return row ?? null;
}

export async function listActiveRoomNames(propertyId: string): Promise<string[]> {
  const rows = await db
    .select({ name: rooms.name })
    .from(rooms)
    .where(and(eq(rooms.propertyId, propertyId), isNull(rooms.deletedAt)));
  return rows.map((r) => r.name);
}

export async function insertRoomsInTransaction(
  records: { propertyId: string; name: string; baseRent: number }[],
): Promise<RoomRow[]> {
  return db.transaction(async (tx) => {
    return tx.insert(rooms).values(records).returning();
  });
}
