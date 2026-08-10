import { describe, expect, it } from "vitest";
import { UnprocessableError } from "../../../src/lib/errors.js";
import {
  assertSurchargePeriod,
  rangesOverlap,
} from "../../../src/modules/charges/rules.js";

describe("surcharge effective-period rules", () => {
  it("treats touching inclusive ranges as overlapping", () => {
    expect(
      rangesOverlap(
        "2026-01-01",
        "2026-01-31",
        "2026-01-31",
        "2026-02-28",
      ),
    ).toBe(true);
  });

  it("allows same-name versions separated by at least one day", () => {
    expect(
      rangesOverlap(
        "2026-01-01",
        "2026-01-31",
        "2026-02-01",
        "2026-02-28",
      ),
    ).toBe(false);
  });

  it("treats a null end as positive infinity", () => {
    expect(
      rangesOverlap("2026-01-01", null, "2099-01-01", "2099-01-31"),
    ).toBe(true);
  });

  it("rejects an end date before the start date with 422", () => {
    expect(() =>
      assertSurchargePeriod("2026-07-31", "2026-07-01"),
    ).toThrow(UnprocessableError);

    try {
      assertSurchargePeriod("2026-07-31", "2026-07-01");
    } catch (error) {
      expect(error).toMatchObject({
        status: 422,
        code: "UNPROCESSABLE",
      });
    }
  });
});
