import { describe, expect, it } from "vitest";
import { UnprocessableError } from "../../../src/lib/errors.js";
import {
  assertWaterFields,
  getWaterFieldIssues,
} from "../../../src/modules/utilities/rules.js";
import type { UtilityRateInput } from "../../../src/modules/utilities/schema.js";

function input(
  overrides: Partial<UtilityRateInput> = {},
): UtilityRateInput {
  return {
    electricityRatePerKwh: 3500,
    waterBillingMethod: "Metered",
    waterRatePerM3: 15000,
    effectiveFrom: "2026-07-01",
    ...overrides,
  };
}

describe("utility water billing rules", () => {
  it("accepts Metered with only waterRatePerM3", () => {
    expect(getWaterFieldIssues(input())).toEqual([]);
    expect(() => assertWaterFields(input())).not.toThrow();
  });

  it("accepts Flat with only waterFlatAmountPerTenant", () => {
    const flat = input({
      waterBillingMethod: "Flat",
      waterRatePerM3: undefined,
      waterFlatAmountPerTenant: 50000,
    });

    expect(getWaterFieldIssues(flat)).toEqual([]);
  });

  it("rejects Metered without a metered rate as a 422 business error", () => {
    const invalid = input({ waterRatePerM3: undefined });

    expect(() => assertWaterFields(invalid)).toThrow(UnprocessableError);
    try {
      assertWaterFields(invalid);
    } catch (error) {
      expect(error).toMatchObject({
        status: 422,
        code: "UNPROCESSABLE",
        fields: [
          {
            field: "waterRatePerM3",
            message: "waterRatePerM3 is required when method is Metered.",
          },
        ],
      });
    }
  });

  it("rejects fields belonging to the other billing method", () => {
    expect(
      getWaterFieldIssues(
        input({
          waterBillingMethod: "Flat",
          waterFlatAmountPerTenant: 50000,
          waterRatePerM3: 15000,
        }),
      ),
    ).toContainEqual({
      field: "waterRatePerM3",
      message: "waterRatePerM3 must be omitted for Flat.",
    });
  });

  it("reports both Metered errors when Flat data is supplied instead", () => {
    expect(
      getWaterFieldIssues(
        input({
          waterRatePerM3: undefined,
          waterFlatAmountPerTenant: 50000,
        }),
      ),
    ).toHaveLength(2);
  });

  it("requires the flat amount for Flat billing", () => {
    expect(
      getWaterFieldIssues(
        input({
          waterBillingMethod: "Flat",
          waterRatePerM3: undefined,
          waterFlatAmountPerTenant: undefined,
        }),
      ),
    ).toContainEqual({
      field: "waterFlatAmountPerTenant",
      message: "waterFlatAmountPerTenant is required when method is Flat.",
    });
  });
});
