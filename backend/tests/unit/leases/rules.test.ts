import { describe, expect, it } from "vitest";
import { UnprocessableError } from "../../../src/lib/errors.js";
import { addDays, assertLeasePeriod, rangesOverlap } from "../../../src/modules/leases/rules.js";

describe("lease period rules", () => {
  it("treats touching inclusive ranges as overlapping", () => {
    expect(rangesOverlap("2026-01-01", "2026-06-30", "2026-06-30", "2026-12-31")).toBe(true);
  });

  it("allows two leases separated by at least one day", () => {
    expect(rangesOverlap("2026-01-01", "2026-06-30", "2026-07-01", "2026-12-31")).toBe(false);
  });

  it("rejects an end date not after the start date with 422", () => {
    expect(() => assertLeasePeriod("2026-07-01", "2026-07-01")).toThrow(UnprocessableError);
    try {
      assertLeasePeriod("2026-07-31", "2026-07-01");
    } catch (error) {
      expect(error).toMatchObject({ status: 422, code: "UNPROCESSABLE" });
    }
  });

  it("accepts a valid period", () => {
    expect(() => assertLeasePeriod("2026-01-01", "2026-12-31")).not.toThrow();
  });
});

describe("addDays", () => {
  it("adds days within a month", () => {
    expect(addDays("2026-01-01", 7)).toBe("2026-01-08");
  });

  it("rolls over month/year boundaries", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });
});
