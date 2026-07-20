import { describe, expect, it } from "vitest";
import {
  BILLING_PERIOD_REGEX,
  deriveInvoiceDates,
  isValidBillingPeriod,
  periodBounds,
  previousMonthPeriod,
} from "../../../src/lib/billingPeriod.js";

describe("billingPeriod helpers", () => {
  it("matches only YYYY-MM", () => {
    expect(BILLING_PERIOD_REGEX.test("2026-06")).toBe(true);
    expect(isValidBillingPeriod("2026-06")).toBe(true);
    expect(isValidBillingPeriod("2026-13")).toBe(false);
    expect(isValidBillingPeriod("2026-6")).toBe(false);
    expect(isValidBillingPeriod("2026/06")).toBe(false);
    expect(isValidBillingPeriod("2026-061")).toBe(false);
  });

  it("computes inclusive period bounds", () => {
    expect(periodBounds("2026-06")).toEqual({
      start: "2026-06-01",
      end: "2026-06-30",
    });
    expect(periodBounds("2026-02")).toEqual({
      start: "2026-02-01",
      end: "2026-02-28",
    });
    expect(periodBounds("2024-02")).toEqual({
      start: "2024-02-01",
      end: "2024-02-29",
    });
  });

  it("computes the previous calendar month", () => {
    expect(previousMonthPeriod(new Date(Date.UTC(2026, 6, 19)))).toBe("2026-06");
    expect(previousMonthPeriod(new Date(Date.UTC(2026, 0, 15)))).toBe("2025-12");
    expect(previousMonthPeriod(new Date(Date.UTC(2026, 11, 31)))).toBe("2026-11");
  });

  it("derives issue and due dates from configured days", () => {
    expect(deriveInvoiceDates("2026-06")).toEqual({
      issueDate: "2026-06-01",
      dueDate: "2026-06-05",
    });
  });
});
