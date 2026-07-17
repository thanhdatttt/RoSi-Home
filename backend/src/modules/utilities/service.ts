import { writeAudit } from "../../db/audit.js";
import {
  assertPropertyOwned,
  createUtilityRate,
  getCurrentRate,
  type UtilityRateRow,
} from "./repository.js";
import type { UtilityRateInput } from "./schema.js";

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

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// US-UTILITY-01 — append a new versioned rate row (never update in place).
export async function createUtilityRateService(
  landlordId: string,
  propertyId: string,
  input: UtilityRateInput,
): Promise<UtilityRateView> {
  await assertPropertyOwned(propertyId, landlordId);
  const row = await createUtilityRate(propertyId, landlordId, input);
  await writeAudit({
    actorUserId: landlordId,
    action: "utility_rate.created",
    entityType: "utility_rate_history",
    entityId: row.id,
  });
  return serialize(row);
}

// US-UTILITY-02 — current effective rate: latest row with effectiveFrom <= today.
export async function getCurrentRateService(
  landlordId: string,
  propertyId: string,
): Promise<UtilityRateView | null> {
  await assertPropertyOwned(propertyId, landlordId);
  const row = await getCurrentRate(propertyId, todayStr());
  return row ? serialize(row) : null;
}
