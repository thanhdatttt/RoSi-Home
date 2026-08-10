import { describe, expect, it } from "vitest";
import {
  maintenanceRequestListQuerySchema,
  roomMaintenanceHistoryParamsSchema,
  submitMaintenanceRequestSchema,
  updateMaintenanceStatusSchema,
} from "../../../src/modules/maintenance/schema.js";

const valid = {
  roomId: "66666666-6666-4666-8666-666666666666",
  title: "Leaking sink",
  description: "Water is leaking continuously below the sink.",
};

describe("submitMaintenanceRequestSchema", () => {
  it("US-MAINT-01: trims required title and description", () => {
    expect(
      submitMaintenanceRequestSchema.parse({
        ...valid,
        title: "  Leaking sink  ",
        description: "  Detailed description  ",
      }),
    ).toMatchObject({ title: "Leaking sink", description: "Detailed description" });
  });

  it.each(["title", "description"] as const)(
    "US-MAINT-01: rejects a blank %s",
    (field) => {
      const result = submitMaintenanceRequestSchema.safeParse({
        ...valid,
        [field]: "   ",
      });
      expect(result.success).toBe(false);
    },
  );

  it("rejects an invalid room id", () => {
    expect(
      submitMaintenanceRequestSchema.safeParse({ ...valid, roomId: "room-101" })
        .success,
    ).toBe(false);
  });
});

describe("maintenanceRequestListQuerySchema", () => {
  it("US-MAINT-03: parses landlord property and status filters with pagination", () => {
    expect(
      maintenanceRequestListQuerySchema.parse({
        propertyId: "22222222-2222-4222-8222-222222222222",
        status: "InProgress",
        page: "2",
        pageSize: "5",
      }),
    ).toEqual({
      propertyId: "22222222-2222-4222-8222-222222222222",
      status: "InProgress",
      page: 2,
      pageSize: 5,
    });
  });

  it.each(["In Progress", "Draft", "completed"])(
    "US-MAINT-03: rejects unsupported status %s",
    (status) => {
      expect(
        maintenanceRequestListQuerySchema.safeParse({ status }).success,
      ).toBe(false);
    },
  );

  it("US-MAINT-03: rejects an invalid property filter", () => {
    expect(
      maintenanceRequestListQuerySchema.safeParse({ propertyId: "property-1" })
        .success,
    ).toBe(false);
  });
});

describe("updateMaintenanceStatusSchema", () => {
  it.each(["Pending", "InProgress", "Completed"] as const)(
    "US-MAINT-04: accepts the supported status %s",
    (status) => {
      expect(updateMaintenanceStatusSchema.parse({ status })).toEqual({ status });
    },
  );

  it.each(["In Progress", "Draft", "completed", ""])(
    "US-MAINT-04: rejects unsupported status %s",
    (status) => {
      expect(updateMaintenanceStatusSchema.safeParse({ status }).success).toBe(
        false,
      );
    },
  );

  it("US-MAINT-04: rejects additional fields", () => {
    expect(
      updateMaintenanceStatusSchema.safeParse({
        status: "Completed",
        completedAt: "2026-07-22T03:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});

describe("roomMaintenanceHistoryParamsSchema", () => {
  it("US-MAINT-05: accepts a UUID roomId and rejects malformed or extra params", () => {
    expect(
      roomMaintenanceHistoryParamsSchema.parse({
        roomId: "66666666-6666-4666-8666-666666666666",
      }),
    ).toEqual({ roomId: "66666666-6666-4666-8666-666666666666" });
    expect(
      roomMaintenanceHistoryParamsSchema.safeParse({ roomId: "room-101" })
        .success,
    ).toBe(false);
    expect(
      roomMaintenanceHistoryParamsSchema.safeParse({
        roomId: "66666666-6666-4666-8666-666666666666",
        propertyId: "22222222-2222-4222-8222-222222222222",
      }).success,
    ).toBe(false);
  });
});
