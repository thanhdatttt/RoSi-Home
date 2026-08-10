import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  values: vi.fn(async () => undefined),
  insert: vi.fn(),
}));

vi.mock("../../../src/db/index.js", () => ({
  db: {},
}));

import { writeAudit } from "../../../src/db/audit.js";

describe("writeAudit", () => {
  it("passes structured before/after values to JSONB columns", async () => {
    mocks.insert.mockReturnValue({ values: mocks.values });
    const executor = { insert: mocks.insert };

    await writeAudit(
      {
        actorUserId: "33333333-3333-4333-8333-333333333333",
        action: "surcharge.updated",
        entityType: "surcharges",
        entityId: "11111111-1111-4111-8111-111111111111",
        beforeValue: { monthlyAmount: 100000 },
        afterValue: { monthlyAmount: 120000 },
      },
      executor as never,
    );

    expect(mocks.values).toHaveBeenCalledWith(
      expect.objectContaining({
        beforeValue: { monthlyAmount: 100000 },
        afterValue: { monthlyAmount: 120000 },
      }),
    );
  });
});
