import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { regulatoryRateDefaults } from "../../db/schema.js";
import { getCurrentRate } from "./repository.js";
import { UnprocessableError } from "../../lib/errors.js";

// Rate resolution for billing calculations (US-METER-02, US-INVOICE-01).
// Prefers the landlord-defined effective rate for the property; if none exists,
// falls back to the developer-seeded regulatory default applicable to the
// property's locality and the billing-period date. It must NOT silently apply
// an expired or different-locality default.

export type ResolvedRate = {
  utilityType: "Electricity" | "Water";
  source: "landlord" | "regulatory";
  sourceId: string;
  sourceReference: string | null;
  effectiveFrom: string;
  // Electricity
  ratePerKwh?: number;
  // Water
  method?: "Metered" | "Flat";
  ratePerM3?: number | null;
  flatAmountPerTenant?: number | null;
};

type RegulatoryDefaultRow = typeof regulatoryRateDefaults.$inferSelect;

export async function getRegulatoryDefault(
  utilityType: "Electricity" | "Water",
  locality: string | null,
  date: string,
): Promise<RegulatoryDefaultRow | null> {
  if (locality === null) return null;
  const [row] = await db
    .select()
    .from(regulatoryRateDefaults)
    .where(
      and(
        eq(regulatoryRateDefaults.utilityType, utilityType),
        eq(regulatoryRateDefaults.locality, locality),
        sql`${regulatoryRateDefaults.effectiveFrom} <= ${date}`,
        sql`(${regulatoryRateDefaults.effectiveTo} IS NULL OR ${regulatoryRateDefaults.effectiveTo} >= ${date})`,
      ),
    )
    .orderBy(
      desc(regulatoryRateDefaults.effectiveFrom),
      desc(regulatoryRateDefaults.id),
    )
    .limit(1);
  return row ?? null;
}

export async function resolveElectricityRate(
  propertyId: string,
  locality: string | null,
  date: string,
): Promise<ResolvedRate> {
  const landlord = await getCurrentRate(propertyId, date);
  if (landlord) {
    return {
      utilityType: "Electricity",
      source: "landlord",
      sourceId: landlord.id,
      sourceReference: null,
      effectiveFrom: String(landlord.effectiveFrom),
      ratePerKwh: landlord.electricityRatePerKwh,
    };
  }

  const reg = await getRegulatoryDefault("Electricity", locality, date);
  if (!reg) {
    throw new UnprocessableError(
      "No electricity rate is configured for this property, and no applicable regulatory default exists for its locality and billing period.",
      [
        {
          field: "utilityType",
          message:
            "Configure an electricity rate or a matching regulatory default.",
        },
      ],
    );
  }
  return {
    utilityType: "Electricity",
    source: "regulatory",
    sourceId: reg.id,
    sourceReference: reg.sourceReference,
    effectiveFrom: String(reg.effectiveFrom),
    ratePerKwh: reg.ratePerUnit,
  };
}

export async function resolveWaterRate(
  propertyId: string,
  locality: string | null,
  date: string,
): Promise<ResolvedRate> {
  const landlord = await getCurrentRate(propertyId, date);
  if (landlord) {
    return {
      utilityType: "Water",
      source: "landlord",
      sourceId: landlord.id,
      sourceReference: null,
      effectiveFrom: String(landlord.effectiveFrom),
      method: landlord.waterBillingMethod,
      ratePerM3: landlord.waterRatePerM3,
      flatAmountPerTenant: landlord.waterFlatAmountPerTenant,
    };
  }

  const reg = await getRegulatoryDefault("Water", locality, date);
  if (!reg) {
    throw new UnprocessableError(
      "No water rate is configured for this property, and no applicable regulatory default exists for its locality and billing period.",
      [
        {
          field: "utilityType",
          message: "Configure a water rate or a matching regulatory default.",
        },
      ],
    );
  }
  return {
    utilityType: "Water",
    source: "regulatory",
    sourceId: reg.id,
    sourceReference: reg.sourceReference,
    effectiveFrom: String(reg.effectiveFrom),
    method: reg.method,
    ratePerM3: reg.method === "Metered" ? reg.ratePerUnit : null,
    flatAmountPerTenant: reg.method === "Flat" ? reg.ratePerUnit : null,
  };
}
