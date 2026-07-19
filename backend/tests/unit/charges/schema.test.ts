import { describe, expect, it } from "vitest";
import {
  createSurchargeSchema,
  updateSurchargeSchema,
} from "../../../src/modules/charges/schema.js";

describe("surcharge request schemas", () => {
  it("rejects an empty PATCH body", () => {
    expect(updateSurchargeSchema.safeParse({}).success).toBe(false);
  });

  it("rejects impossible calendar dates", () => {
    const result = createSurchargeSchema.safeParse({
      name: "Internet",
      monthlyAmount: 100000,
      effectiveFrom: "2026-02-30",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes surrounding whitespace in names", () => {
    const result = createSurchargeSchema.parse({
      name: "  Internet  ",
      monthlyAmount: 100000,
      effectiveFrom: "2026-07-01",
    });

    expect(result.name).toBe("Internet");
  });
});
