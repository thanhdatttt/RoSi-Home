import { describe, expect, it } from "vitest";
import { submitMaintenanceRequestSchema } from "../../../src/modules/maintenance/schema.js";

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
