import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const trx = { kind: "transaction" };
  return {
    trx,
    transaction: vi.fn(async (callback: (executor: unknown) => unknown) =>
      callback(trx),
    ),
    assertPropertyOwned: vi.fn(),
    upsertUpcomingRate: vi.fn(),
    getCurrentRate: vi.fn(),
    getUpcomingRate: vi.fn(),
    businessDate: vi.fn(() => "2026-07-19"),
    writeAudit: vi.fn(),
  };
});

vi.mock("../../../src/db/index.js", () => ({
  db: { transaction: mocks.transaction },
}));

vi.mock("../../../src/db/audit.js", () => ({
  writeAudit: mocks.writeAudit,
}));

vi.mock("../../../src/lib/businessDate.js", () => ({
  businessDate: mocks.businessDate,
}));

vi.mock("../../../src/modules/utilities/repository.js", () => ({
  assertPropertyOwned: mocks.assertPropertyOwned,
  upsertUpcomingRate: mocks.upsertUpcomingRate,
  getCurrentRate: mocks.getCurrentRate,
  getUpcomingRate: mocks.getUpcomingRate,
}));

import {
  createUtilityRateService,
  getRatesService,
} from "../../../src/modules/utilities/service.js";

describe("createUtilityRateService", () => {
  beforeEach(() => {
    mocks.assertPropertyOwned.mockResolvedValue(undefined);
    mocks.writeAudit.mockResolvedValue(undefined);
    mocks.upsertUpcomingRate.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      propertyId: "22222222-2222-4222-8222-222222222222",
      electricityRatePerKwh: 3500,
      waterBillingMethod: "Metered",
      waterRatePerM3: 15000,
      waterFlatAmountPerTenant: null,
      effectiveFrom: "2099-07-01",
      createdBy: "33333333-3333-4333-8333-333333333333",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
    });
  });

  it("uses the same transaction executor for mutation and audit", async () => {
    await createUtilityRateService(
      "33333333-3333-4333-8333-333333333333",
      "22222222-2222-4222-8222-222222222222",
      {
        electricityRatePerKwh: 3500,
        waterBillingMethod: "Metered",
        waterRatePerM3: 15000,
        effectiveFrom: "2099-07-01",
      },
    );

    expect(mocks.upsertUpcomingRate).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
      "33333333-3333-4333-8333-333333333333",
      expect.any(Object),
      "2026-07-19",
      mocks.trx,
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "utility_rate.created_or_updated" }),
      mocks.trx,
    );
  });

  it("rejects an invalid business combination before a DB transaction", async () => {
    await expect(
      createUtilityRateService(
        "33333333-3333-4333-8333-333333333333",
        "22222222-2222-4222-8222-222222222222",
        {
          electricityRatePerKwh: 3500,
          waterBillingMethod: "Metered",
          effectiveFrom: "2099-07-01",
        },
      ),
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE" });

    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("resolves the current rate using the Vietnam business date", async () => {
    mocks.getCurrentRate.mockResolvedValue(null);
    mocks.getUpcomingRate.mockResolvedValue(null);

    await getRatesService(
      "33333333-3333-4333-8333-333333333333",
      "22222222-2222-4222-8222-222222222222",
    );

    expect(mocks.businessDate).toHaveBeenCalledOnce();
    expect(mocks.getCurrentRate).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
      "2026-07-19",
    );
    expect(mocks.getUpcomingRate).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
      "2026-07-19",
    );
  });
});
