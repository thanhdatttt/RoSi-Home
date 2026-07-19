import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const trx = { kind: "transaction" };
  return {
    trx,
    transaction: vi.fn(async (callback: (executor: unknown) => unknown) =>
      callback(trx),
    ),
    assertPropertyOwned: vi.fn(),
    createSurcharge: vi.fn(),
    findActiveSurchargesByName: vi.fn(),
    findSurchargeScoped: vi.fn(),
    lockSurchargeName: vi.fn(),
    listActiveSurcharges: vi.fn(),
    softDeleteSurcharge: vi.fn(),
    updateSurcharge: vi.fn(),
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
  createSurcharge: mocks.createSurcharge,
  findActiveSurchargesByName: mocks.findActiveSurchargesByName,
  findSurchargeScoped: mocks.findSurchargeScoped,
  lockSurchargeName: mocks.lockSurchargeName,
  listActiveSurcharges: mocks.listActiveSurcharges,
  softDeleteSurcharge: mocks.softDeleteSurcharge,
  updateSurcharge: mocks.updateSurcharge,
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
  effectiveFrom: "2026-07-01",
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
    mocks.findActiveSurchargesByName.mockResolvedValue([]);
    mocks.lockSurchargeName.mockResolvedValue(undefined);
    mocks.writeAudit.mockResolvedValue(undefined);
    mocks.createSurcharge.mockResolvedValue(existingSurcharge);
    mocks.findSurchargeScoped.mockResolvedValue(existingSurcharge);
    mocks.updateSurcharge.mockResolvedValue({
      ...existingSurcharge,
      monthlyAmount: 120000,
      updatedAt: new Date("2026-07-02T00:00:00.000Z"),
    });
    mocks.softDeleteSurcharge.mockResolvedValue(undefined);
  });

  it("locks the surcharge name before the conflict query, create, and audit", async () => {
    await createSurchargeService(
      "33333333-3333-4333-8333-333333333333",
      "22222222-2222-4222-8222-222222222222",
      {
        name: "Internet",
        monthlyAmount: 100000,
        effectiveFrom: "2026-07-01",
      },
    );

    expect(mocks.lockSurchargeName).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
      "Internet",
      mocks.trx,
    );
    expect(mocks.findActiveSurchargesByName).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
      "Internet",
      mocks.trx,
    );
    expect(
      mocks.lockSurchargeName.mock.invocationCallOrder[0],
    ).toBeLessThan(
      mocks.findActiveSurchargesByName.mock.invocationCallOrder[0],
    );
    expect(mocks.createSurcharge).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
      "33333333-3333-4333-8333-333333333333",
      expect.any(Object),
      mocks.trx,
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "surcharge.created" }),
      mocks.trx,
    );
  });

  it("rejects an overlapping version without creating or auditing", async () => {
    mocks.findActiveSurchargesByName.mockResolvedValue([
      {
        id: "44444444-4444-4444-8444-444444444444",
        propertyId: "22222222-2222-4222-8222-222222222222",
        name: "Internet",
        monthlyAmount: 90000,
        effectiveFrom: "2026-01-01",
        effectiveTo: null,
        active: true,
        createdBy: "33333333-3333-4333-8333-333333333333",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        deletedAt: null,
        deletedBy: null,
      },
    ]);

    await expect(
      createSurchargeService(
        "33333333-3333-4333-8333-333333333333",
        "22222222-2222-4222-8222-222222222222",
        {
          name: "Internet",
          monthlyAmount: 100000,
          effectiveFrom: "2026-07-01",
        },
      ),
    ).rejects.toMatchObject({ status: 409, code: "CONFLICT" });

    expect(mocks.createSurcharge).not.toHaveBeenCalled();
    expect(mocks.writeAudit).not.toHaveBeenCalled();
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
      { monthlyAmount: 120000 },
      mocks.trx,
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "surcharge.updated" }),
      mocks.trx,
    );
  });

  it("locks the resulting name before checking an overlap-changing update", async () => {
    await updateSurchargeService(
      "33333333-3333-4333-8333-333333333333",
      "11111111-1111-4111-8111-111111111111",
      { effectiveTo: "2026-12-31" },
    );

    expect(mocks.lockSurchargeName).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
      "Internet",
      mocks.trx,
    );
    expect(
      mocks.lockSurchargeName.mock.invocationCallOrder[0],
    ).toBeLessThan(
      mocks.findActiveSurchargesByName.mock.invocationCallOrder[0],
    );
  });

  it("rejects an update that makes the effective period invalid", async () => {
    await expect(
      updateSurchargeService(
        "33333333-3333-4333-8333-333333333333",
        "11111111-1111-4111-8111-111111111111",
        { effectiveTo: "2026-06-30" },
      ),
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE" });

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
