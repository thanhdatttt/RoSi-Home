import "dotenv/config";
import { db } from "../index.js";
import { regulatoryRateDefaults } from "../schema.js";

export async function seedRegulatoryRateDefaults(): Promise<void> {
  const existing = await db.select({ id: regulatoryRateDefaults.id }).from(regulatoryRateDefaults).limit(1);
  if (existing.length > 0) {
    console.info("Regulatory rate defaults already seeded; skipping.");
    return;
  }
  // PD-03: seed defaults versioned by source, locality, effective date.
  // Replace with official Vietnam rental electricity / water tariffs for your locality.
  await db.insert(regulatoryRateDefaults).values([
    {
      utilityType: "Electricity",
      locality: "HN",
      method: "Metered",
      ratePerUnit: 3500,
      sourceReference: "Example: EVN retail tariff (replace with official citation)",
      effectiveFrom: "2024-01-01",
    },
    {
      utilityType: "Water",
      locality: "HN",
      method: "Metered",
      ratePerUnit: 15000,
      sourceReference: "Example: Hanoi water tariff (replace with official citation)",
      effectiveFrom: "2024-01-01",
    },
  ]);
  console.info("Seeded regulatory rate defaults.");
}

async function main(): Promise<void> {
  await seedRegulatoryRateDefaults();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
