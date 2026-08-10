import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  orderByArguments: [] as unknown[],
}));

vi.mock("../../../src/db/index.js", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn((...args: unknown[]) => {
            mocks.orderByArguments = args;
            return {
              limit: vi.fn(async () => []),
            };
          }),
        })),
      })),
    })),
  },
}));

vi.mock("../../../src/modules/properties/repository.js", () => ({
  findProperty: vi.fn(),
}));

import { getCurrentRate } from "../../../src/modules/utilities/repository.js";

describe("getCurrentRate", () => {
  it("uses effective date plus createdAt and id tie-breakers", async () => {
    await getCurrentRate(
      "22222222-2222-4222-8222-222222222222",
      "2026-07-19",
    );

    expect(mocks.orderByArguments).toHaveLength(3);
  });
});
