import { describe, expect, it } from "vitest";
import { utilityRateSchema } from "../../../src/modules/utilities/schema.js";

describe("utilityRateSchema", () => {
  it("keeps method compatibility in the service layer", () => {
    const result = utilityRateSchema.safeParse({
      electricityRatePerKwh: 3500,
      waterBillingMethod: "Metered",
      effectiveFrom: "2026-07-01",
    });

    expect(result.success).toBe(true);
  });

  it("rejects negative VND rates", () => {
    const result = utilityRateSchema.safeParse({
      electricityRatePerKwh: -1,
      waterBillingMethod: "Flat",
      waterFlatAmountPerTenant: 50000,
      effectiveFrom: "2026-07-01",
    });

    expect(result.success).toBe(false);
  });

  it("rejects impossible calendar dates", () => {
    const result = utilityRateSchema.safeParse({
      electricityRatePerKwh: 3500,
      waterBillingMethod: "Metered",
      waterRatePerM3: 15000,
      effectiveFrom: "2026-02-30",
    });

    expect(result.success).toBe(false);
  });
});
