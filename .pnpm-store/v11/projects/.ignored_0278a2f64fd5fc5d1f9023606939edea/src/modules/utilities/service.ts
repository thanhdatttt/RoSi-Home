import { writeAudit } from "../../db/audit.js";
import { db } from "../../db/index.js";
import { businessDate } from "../../lib/businessDate.js";
import {
  assertPropertyOwned,
  upsertUpcomingRate,
  getCurrentRate,
  getUpcomingRate,
  type UtilityRateRow,
} from "./repository.js";
import type { UtilityRateInput } from "./schema.js";
import { assertWaterFields } from "./rules.js";

export type UtilityRateView = {
  id: string;
  propertyId: string;
  electricityRatePerKwh: number;
  waterBillingMethod: "Metered" | "Flat";
  waterRatePerM3: number | null;
  waterFlatAmountPerTenant: number | null;
  effectiveFrom: string;
  createdBy: string;
  createdAt: string;
};

function serialize(row: UtilityRateRow): UtilityRateView {
  return {
    id: row.id,
    propertyId: row.propertyId,
    electricityRatePerKwh: row.electricityRatePerKwh,
    waterBillingMethod: row.waterBillingMethod,
    waterRatePerM3: row.waterRatePerM3,
    waterFlatAmountPerTenant: row.waterFlatAmountPerTenant,
    effectiveFrom: String(row.effectiveFrom),
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  };
}

// US-UTILITY-01 — upsert a future rate row.
export async function createUtilityRateService(
  landlordId: string,
  propertyId: string,
  input: UtilityRateInput,
): Promise<UtilityRateView> {
  assertWaterFields(input);
  await assertPropertyOwned(propertyId, landlordId);
  return db.transaction(async (rawTrx) => {
    const trx = rawTrx as unknown as typeof db;
    const row = await upsertUpcomingRate(propertyId, landlordId, input, businessDate(), trx);
    await writeAudit(
      {
        actorUserId: landlordId,
        action: "utility_rate.created_or_updated",
        entityType: "utility_rate_history",
        entityId: row.id,
      },
      trx,
    );
    return serialize(row);
  });
}

// US-UTILITY-02 — returns both current effective rate (<= today) and upcoming rate (> today).
export async function getRatesService(
  landlordId: string,
  propertyId: string,
): Promise<{ current: UtilityRateView | null; upcoming: UtilityRateView | null }> {
  await assertPropertyOwned(propertyId, landlordId);
  const today = businessDate();
  const [currentRow, upcomingRow] = await Promise.all([
    getCurrentRate(propertyId, today),
    getUpcomingRate(propertyId, today),
  ]);
  
  return {
    current: currentRow ? serialize(currentRow) : null,
    upcoming: upcomingRow ? serialize(upcomingRow) : null,
  };
}
