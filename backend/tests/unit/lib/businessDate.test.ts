import { describe, expect, it } from "vitest";
import {
  BUSINESS_TIME_ZONE,
  businessDate,
} from "../../../src/lib/businessDate.js";

describe("businessDate", () => {
  it("uses the Vietnam calendar date after local midnight", () => {
    const instant = new Date("2026-07-18T17:30:00.000Z");

    expect(BUSINESS_TIME_ZONE).toBe("Asia/Ho_Chi_Minh");
    expect(businessDate(instant)).toBe("2026-07-19");
  });

  it("does not advance before local midnight", () => {
    const instant = new Date("2026-07-18T16:59:59.999Z");

    expect(businessDate(instant)).toBe("2026-07-18");
  });
});
