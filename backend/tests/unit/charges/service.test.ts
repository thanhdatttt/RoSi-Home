import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const trx = { kind: "transaction" };
  return {
    trx,
    transaction: vi.fn(async (callback: (executor: unknown) => unknown) =>
      callback(trx),
    ),
    assertPropertyOwned: vi.fn(),
    upsertUpcomingSurcharge: vi.fn(),
    findSurchargeScoped: vi.fn(),
    listActiveSurcharges: vi.fn(),
    softDeleteSurcharge: vi.fn(),
    updateSurcharge: vi.fn(),
    findOverlappingSurcharges: vi.fn().mockResolvedValue([]),
    writeAudit: vi.fn(),
  };
});

vi.mock("../../../src/db/index.js", () => ({
  db: { transaction: mocks.transaction },
}));

vi.mock("../../../src/db/audit.js", () => ({
  writeAudit: mocks.writeAudit,
}));

vi.mock("../../../src/modules/charges/repository.js", () => ({
  assertPropertyOwned: mocks.assertPropertyOwned,
  upsertUpcomingSurcharge: mocks.upsertUpcomingSurcharge,
  findSurchargeScoped: mocks.findSurchargeScoped,
  listActiveSurcharges: mocks.listActiveSurcharges,
  softDeleteSurcharge: mocks.softDeleteSurcharge,
  updateSurcharge: mocks.updateSurcharge,
  findOverlappingSurcharges: mocks.findOverlappingSurcharges,
}));

import {
  createSurchargeService,
  deleteSurchargeService,
  updateSurchargeService,
} from "../../../src/modules/charges/service.js";

const existingSurcharge = {
  id: "11111111-1111-4111-8111-111111111111",
  propertyId: "22222222-2222-4222-8222-222222222222",
  name: "Internet",
  monthlyAmount: 100000,
  effectiveFrom: "2099-07-01",
  effectiveTo: null,
  active: true,
  createdBy: "33333333-3333-4333-8333-333333333333",
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  updatedAt: new Date("2026-07-01T00:00:00.000Z"),
  deletedAt: null,
  deletedBy: null,
};

describe("createSurchargeService", () => {
  beforeEach(() => {
    mocks.assertPropertyOwned.mockResolvedValue(undefined);
    mocks.writeAudit.mockResolvedValue(undefined);
    mocks.upsertUpcomingSurcharge.mockResolvedValue(existingSurcharge);
    mocks.findSurchargeScoped.mockResolvedValue(existingSurcharge);
    mocks.updateSurcharge.mockResolvedValue({
      ...existingSurcharge,
      monthlyAmount: 120000,
      updatedAt: new Date("2026-07-02T00:00:00.000Z"),
    });
    mocks.softDeleteSurcharge.mockResolvedValue(undefined);
  });

  it("upserts and audits with the same transaction executor", async () => {
    await createSurchargeService(
      "33333333-3333-4333-8333-333333333333",
      "22222222-2222-4222-8222-222222222222",
      {
        name: "Internet",
        monthlyAmount: 100000,
        effectiveFrom: "2099-07-01",
      },
    );

    expect(mocks.upsertUpcomingSurcharge).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
      "33333333-3333-4333-8333-333333333333",
      expect.any(Object),
      expect.any(String), // today date
      mocks.trx,
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "surcharge.upserted" }),
      mocks.trx,
    );
  });

  it("updates and audits with the same transaction executor", async () => {
    await updateSurchargeService(
      "33333333-3333-4333-8333-333333333333",
      "11111111-1111-4111-8111-111111111111",
      { monthlyAmount: 120000 },
    );

    expect(mocks.findSurchargeScoped).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "33333333-3333-4333-8333-333333333333",
      mocks.trx,
    );
    expect(mocks.updateSurcharge).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      expect.any(Object),
      mocks.trx,
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "surcharge.updated" }),
      mocks.trx,
    );
  });

  it("rejects an update if the surcharge is already in effect", async () => {
    mocks.findSurchargeScoped.mockResolvedValueOnce({
      ...existingSurcharge,
      effectiveFrom: "2000-01-01", // Past date
    });

    await expect(
      updateSurchargeService(
        "33333333-3333-4333-8333-333333333333",
        "11111111-1111-4111-8111-111111111111",
        { effectiveTo: "2026-06-30" },
      ),
    ).rejects.toMatchObject({ status: 409, code: "CONFLICT" });

    expect(mocks.updateSurcharge).not.toHaveBeenCalled();
  });

  it("soft-deletes and audits with the same transaction executor", async () => {
    await deleteSurchargeService(
      "33333333-3333-4333-8333-333333333333",
      "11111111-1111-4111-8111-111111111111",
    );

    expect(mocks.softDeleteSurcharge).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "33333333-3333-4333-8333-333333333333",
      mocks.trx,
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "surcharge.deleted" }),
      mocks.trx,
    );
  });
});
