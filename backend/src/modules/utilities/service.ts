import { writeAudit } from "../../db/audit.js";
import { db } from "../../db/index.js";
import { businessDate } from "../../lib/businessDate.js";
import {
  assertPropertyOwned,
  createUtilityRate,
  getCurrentRate,
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

// US-UTILITY-01 — append a new versioned rate row (never update in place).
export async function createUtilityRateService(
  landlordId: string,
  propertyId: string,
  input: UtilityRateInput,
): Promise<UtilityRateView> {
  assertWaterFields(input);
  await assertPropertyOwned(propertyId, landlordId);
  return db.transaction(async (rawTrx) => {
    const trx = rawTrx as unknown as typeof db;
    const row = await createUtilityRate(propertyId, landlordId, input, trx);
    await writeAudit(
      {
        actorUserId: landlordId,
        action: "utility_rate.created",
        entityType: "utility_rate_history",
        entityId: row.id,
      },
      trx,
    );
    return serialize(row);
  });
}

// US-UTILITY-02 — current effective rate: latest row with effectiveFrom <= today.
export async function getCurrentRateService(
  landlordId: string,
  propertyId: string,
): Promise<UtilityRateView | null> {
  await assertPropertyOwned(propertyId, landlordId);
  const row = await getCurrentRate(propertyId, businessDate());
  return row ? serialize(row) : null;
}
