import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { meterReadings } from "../../db/schema.js";
import { findActiveRoom } from "../rooms/repository.js";
import { findProperty } from "../properties/repository.js";
import { NotFoundError } from "../../lib/errors.js";

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

<<<<<<< HEAD
export async function listActiveReadings(
  roomId: string,
  billingPeriod: string,
): Promise<MeterReadingRow[]> {
  return db
    .select()
    .from(meterReadings)
    .where(
      and(
        eq(meterReadings.roomId, roomId),
        eq(meterReadings.billingPeriod, billingPeriod),
        isNull(meterReadings.supersededAt),
      ),
    )
    .orderBy(meterReadings.utilityType);
}

=======
>>>>>>> origin/main
// Immediately preceding applicable reading for consumption calculation.
export async function findPreviousReading(
  roomId: string,
  utilityType: "Electricity" | "Water",
  billingPeriod: string,
<<<<<<< HEAD
  executor: typeof db = db,
): Promise<MeterReadingRow | null> {
  const [row] = await executor
=======
): Promise<MeterReadingRow | null> {
  const [row] = await db
>>>>>>> origin/main
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
<<<<<<< HEAD
    correctionOf?: string | null;
=======
>>>>>>> origin/main
    recordedBy: string;
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
