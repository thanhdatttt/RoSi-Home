import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { utilityRateHistory } from "../../db/schema.js";
import { findProperty } from "../properties/repository.js";
import { NotFoundError } from "../../lib/errors.js";
import type { UtilityRateInput } from "./schema.js";

export type UtilityRateRow = typeof utilityRateHistory.$inferSelect;

export async function assertPropertyOwned(
  propertyId: string,
  landlordId: string,
): Promise<void> {
  const prop = await findProperty(landlordId, propertyId);
  if (!prop) throw new NotFoundError("Property not found.");
}

export async function createUtilityRate(
  propertyId: string,
  createdBy: string,
  input: UtilityRateInput,
  executor: typeof db = db,
): Promise<UtilityRateRow> {
  const [row] = await executor
    .insert(utilityRateHistory)
    .values({
      propertyId,
      createdBy,
      electricityRatePerKwh: input.electricityRatePerKwh,
      waterBillingMethod: input.waterBillingMethod,
      waterRatePerM3: input.waterRatePerM3 ?? null,
      waterFlatAmountPerTenant: input.waterFlatAmountPerTenant ?? null,
      effectiveFrom: input.effectiveFrom,
    })
    .returning();
  return row;
}

export async function getCurrentRate(
  propertyId: string,
  today: string,
): Promise<UtilityRateRow | null> {
  const [row] = await db
    .select()
    .from(utilityRateHistory)
    .where(
      and(
        eq(utilityRateHistory.propertyId, propertyId),
        sql`${utilityRateHistory.effectiveFrom} <= ${today}`,
      ),
    )
    .orderBy(
      desc(utilityRateHistory.effectiveFrom),
      desc(utilityRateHistory.createdAt),
      desc(utilityRateHistory.id),
    )
    .limit(1);
  return row ?? null;
}
