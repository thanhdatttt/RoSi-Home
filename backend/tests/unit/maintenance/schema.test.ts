import { describe, expect, it } from "vitest";
import {
  maintenanceRequestListQuerySchema,
  submitMaintenanceRequestSchema,
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
