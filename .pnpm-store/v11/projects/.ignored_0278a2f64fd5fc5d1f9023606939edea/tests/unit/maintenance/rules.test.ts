import { describe, expect, it } from "vitest";
import { assertMaintenanceStatusTransition } from "../../../src/modules/maintenance/rules.js";

describe("assertMaintenanceStatusTransition", () => {
  it.each([
    ["Pending", "InProgress"],
    ["Pending", "Completed"],
    ["InProgress", "Completed"],
  ] as const)("US-MAINT-04: allows %s -> %s", (fromStatus, toStatus) => {
    expect(() =>
      assertMaintenanceStatusTransition(fromStatus, toStatus),
    ).not.toThrow();
  });

  it.each(["Pending", "InProgress", "Completed"] as const)(
    "US-MAINT-04: rejects a duplicate %s transition with 422",
    (status) => {
      expect(() =>
        assertMaintenanceStatusTransition(status, status),
      ).toThrowError(
        expect.objectContaining({ status: 422, code: "UNPROCESSABLE" }),
      );
    },
  );

  it.each([
    ["InProgress", "Pending"],
    ["Completed", "Pending"],
    ["Completed", "InProgress"],
  ] as const)(
    "US-MAINT-04: rejects disallowed %s -> %s transitions with 422",
    (fromStatus, toStatus) => {
      expect(() =>
        assertMaintenanceStatusTransition(fromStatus, toStatus),
      ).toThrowError(
        expect.objectContaining({ status: 422, code: "UNPROCESSABLE" }),
      );
    },
  );
});
