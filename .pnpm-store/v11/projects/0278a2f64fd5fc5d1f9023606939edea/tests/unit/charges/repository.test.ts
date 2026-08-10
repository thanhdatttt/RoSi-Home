import { describe, expect, it, vi } from "vitest";

vi.mock("../../../src/db/index.js", () => ({
  db: {},
}));

vi.mock("../../../src/modules/properties/repository.js", () => ({
  findProperty: vi.fn(),
}));

import {
  softDeleteSurcharge,
  updateSurcharge,
} from "../../../src/modules/charges/repository.js";

describe("surcharge repository mutation timestamps", () => {
  it("advances updatedAt during PATCH", async () => {
    let values: Record<string, unknown> = {};
    const row = {
      id: "11111111-1111-4111-8111-111111111111",
      propertyId: "22222222-2222-4222-8222-222222222222",
      name: "Internet",
      monthlyAmount: 120000,
      effectiveFrom: "2026-07-01",
      effectiveTo: null,
      active: true,
      createdBy: "33333333-3333-4333-8333-333333333333",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
      updatedAt: new Date("2026-07-02T00:00:00.000Z"),
      deletedAt: null,
      deletedBy: null,
    };
    const executor = {
      update: vi.fn(() => ({
        set: vi.fn((input: Record<string, unknown>) => {
          values = input;
          return {
            where: vi.fn(() => ({
              returning: vi.fn(async () => [row]),
            })),
          };
        }),
      })),
    };

    await updateSurcharge(
      row.id,
      { monthlyAmount: 120000 },
      executor as never,
    );

    expect(values.monthlyAmount).toBe(120000);
    expect(values.updatedAt).toBeInstanceOf(Date);
  });

  it("sets deletion metadata and updatedAt during soft delete", async () => {
    let values: Record<string, unknown> = {};
    const executor = {
      update: vi.fn(() => ({
        set: vi.fn((input: Record<string, unknown>) => {
          values = input;
          return {
            where: vi.fn(async () => undefined),
          };
        }),
      })),
    };

    await softDeleteSurcharge(
      "11111111-1111-4111-8111-111111111111",
      "33333333-3333-4333-8333-333333333333",
      executor as never,
    );

    expect(values).toMatchObject({
      active: false,
      deletedBy: "33333333-3333-4333-8333-333333333333",
    });
    expect(values.deletedAt).toBeInstanceOf(Date);
    expect(values.updatedAt).toBeInstanceOf(Date);
  });
});
