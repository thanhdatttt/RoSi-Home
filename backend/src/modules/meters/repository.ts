import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { meterReadings } from "../../db/schema.js";
import { findActiveRoom } from "../rooms/repository.js";
import { findProperty } from "../properties/repository.js";
import { NotFoundError } from "../../lib/errors.js";
import type { Pagination } from "../../lib/pagination.js";

export type MeterReadingRow = typeof meterReadings.$inferSelect;

export async function assertRoomOwned(
  roomId: string,
  landlordId: string,
): Promise<{ propertyId: string; locality: string | null }> {
  const room = await findActiveRoom(roomId);
  if (!room) throw new NotFoundError("Room not found.");
  const prop = await findProperty(landlordId, room.propertyId);
  if (!prop) throw new NotFoundError("Room not found.");
  return { propertyId: room.propertyId, locality: prop.locality };
}

export async function findActiveReading(
  roomId: string,
  utilityType: "Electricity" | "Water",
  billingPeriod: string,
  executor: typeof db = db,
): Promise<MeterReadingRow | null> {
  const [row] = await executor
    .select()
    .from(meterReadings)
    .where(
      and(
        eq(meterReadings.roomId, roomId),
        eq(meterReadings.utilityType, utilityType),
        eq(meterReadings.billingPeriod, billingPeriod),
        isNull(meterReadings.supersededAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

// Immediately preceding applicable reading for consumption calculation.
export async function findPreviousReading(
  roomId: string,
  utilityType: "Electricity" | "Water",
  billingPeriod: string,
): Promise<MeterReadingRow | null> {
  const [row] = await db
    .select()
    .from(meterReadings)
    .where(
      and(
        eq(meterReadings.roomId, roomId),
        eq(meterReadings.utilityType, utilityType),
        isNull(meterReadings.supersededAt),
        sql`${meterReadings.billingPeriod} < ${billingPeriod}`,
      ),
    )
    .orderBy(desc(meterReadings.billingPeriod))
    .limit(1);
  return row ?? null;
}

export async function findMeterReadingById(
  id: string,
): Promise<MeterReadingRow | null> {
  const [row] = await db
    .select()
    .from(meterReadings)
    .where(eq(meterReadings.id, id))
    .limit(1);
  return row ?? null;
}

function activeRoomReadingsScope(roomId: string, billingPeriod?: string) {
  return and(
    eq(meterReadings.roomId, roomId),
    billingPeriod ? eq(meterReadings.billingPeriod, billingPeriod) : undefined,
    isNull(meterReadings.supersededAt),
  );
}

export async function listActiveMeterReadings(
  roomId: string,
  pagination: Pagination,
  billingPeriod?: string,
): Promise<MeterReadingRow[]> {
  return db
    .select()
    .from(meterReadings)
    .where(activeRoomReadingsScope(roomId, billingPeriod))
    .orderBy(desc(meterReadings.billingPeriod), desc(meterReadings.createdAt))
    .limit(pagination.pageSize)
    .offset((pagination.page - 1) * pagination.pageSize);
}

export async function countActiveMeterReadings(
  roomId: string,
  billingPeriod?: string,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(meterReadings)
    .where(activeRoomReadingsScope(roomId, billingPeriod));
  return Number(row?.value ?? 0);
}

export async function createMeterReading(
  values: {
    roomId: string;
    utilityType: "Electricity" | "Water";
    billingPeriod: string;
    value: string;
    isInitial: boolean;
    previousValue: string | null;
    consumption: string | null;
    unitRate: number | null;
    amount: number;
    rateSource: string | null;
    rateSourceId: string | null;
    rateSourceReference: string | null;
    rateEffectiveFrom: string | null;
    locality: string | null;
    tenantCount: number | null;
    recordedBy: string;
    correctionOf: string | null;
  },
  executor: typeof db = db,
): Promise<MeterReadingRow> {
  const [row] = await executor
    .insert(meterReadings)
    .values(values)
    .returning();
  return row;
}

export async function supersedeReading(
  id: string,
  supersededAt: Date,
  executor: typeof db = db,
): Promise<void> {
  await executor
    .update(meterReadings)
    .set({ supersededAt })
    .where(eq(meterReadings.id, id));
}
