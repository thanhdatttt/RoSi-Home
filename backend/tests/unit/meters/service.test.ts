import { beforeEach, describe, expect, it, vi } from "vitest";

const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_LANDLORD_ID = "99999999-9999-4999-8999-999999999999";
const ROOM_ID = "22222222-2222-4222-8222-222222222222";
const PROPERTY_ID = "44444444-4444-4444-8444-444444444444";
const READING_ID = "55555555-5555-4555-8555-555555555555";

const mocks = vi.hoisted(() => {
  const trx = { kind: "transaction" };
  return {
    trx,
    transaction: vi.fn(async (callback: (executor: unknown) => unknown) =>
      callback(trx),
    ),
    writeAudit: vi.fn(),
    assertRoomOwned: vi.fn(),
    findActiveReading: vi.fn(),
    findPreviousReading: vi.fn(),
    findMeterReadingById: vi.fn(),
    createMeterReading: vi.fn(),
    supersedeReading: vi.fn(),
    resolveElectricityRate: vi.fn(),
    resolveWaterRate: vi.fn(),
    findActiveInvoiceForRoomPeriod: vi.fn(),
    recalculateDraftInvoice: vi.fn(),
  };
});

vi.mock("../../../src/db/index.js", () => ({
  db: { transaction: mocks.transaction },
}));

vi.mock("../../../src/db/audit.js", () => ({
  writeAudit: mocks.writeAudit,
}));

vi.mock("../../../src/modules/utilities/rateResolver.js", () => ({
  resolveElectricityRate: mocks.resolveElectricityRate,
  resolveWaterRate: mocks.resolveWaterRate,
}));

vi.mock("../../../src/modules/meters/repository.js", () => ({
  assertRoomOwned: mocks.assertRoomOwned,
  createMeterReading: mocks.createMeterReading,
  findActiveReading: mocks.findActiveReading,
  findPreviousReading: mocks.findPreviousReading,
  findMeterReadingById: mocks.findMeterReadingById,
  supersedeReading: mocks.supersedeReading,
}));

vi.mock("../../../src/modules/invoices/repository.js", () => ({
  findActiveInvoiceForRoomPeriod: mocks.findActiveInvoiceForRoomPeriod,
}));

vi.mock("../../../src/modules/invoices/service.js", () => ({
  recalculateDraftInvoice: mocks.recalculateDraftInvoice,
}));

import {
  recordMeterReadingService,
  correctMeterReadingService,
} from "../../../src/modules/meters/service.js";

function baseRow(overrides: Record<string, unknown> = {}) {
  return {
    id: READING_ID,
    roomId: ROOM_ID,
    utilityType: "Electricity" as const,
    billingPeriod: "2026-07",
    value: "150.0000",
    isInitial: false,
    previousValue: "100.0000",
    consumption: "50.0000",
    unitRate: 3500,
    amount: 175000,
    rateSource: "landlord" as const,
    rateSourceId: "66666666-6666-4666-8666-666666666666",
    rateSourceReference: null,
    rateEffectiveFrom: "2026-07-01",
    locality: "Ho Chi Minh City",
    tenantCount: null,
    recordedBy: LANDLORD_ID,
    createdAt: new Date("2026-07-05T00:00:00.000Z"),
    supersededAt: null,
    ...overrides,
  };
}

describe("recordMeterReadingService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockImplementation(
      async (callback: (executor: unknown) => unknown) => callback(mocks.trx),
    );
    mocks.assertRoomOwned.mockResolvedValue({
      propertyId: PROPERTY_ID,
      locality: "Ho Chi Minh City",
    });
    mocks.findActiveReading.mockResolvedValue(null);
    mocks.findPreviousReading.mockResolvedValue(null);
    mocks.resolveWaterRate.mockResolvedValue({
      utilityType: "Water",
      source: "landlord",
      sourceId: "77777777-7777-4777-8777-777777777777",
      sourceReference: null,
      effectiveFrom: "2026-07-01",
      method: "Metered",
      ratePerM3: 15000,
      flatAmountPerTenant: null,
    });
    mocks.resolveElectricityRate.mockResolvedValue({
      utilityType: "Electricity",
      source: "landlord",
      sourceId: "66666666-6666-4666-8666-666666666666",
      sourceReference: null,
      effectiveFrom: "2026-07-01",
      ratePerKwh: 3500,
    });
    mocks.writeAudit.mockResolvedValue(undefined);
    mocks.createMeterReading.mockResolvedValue(baseRow());
  });

  it("US-METER-01: stores an initial baseline reading with no consumption or charge", async () => {
    mocks.createMeterReading.mockResolvedValue(
      baseRow({
        isInitial: true,
        previousValue: null,
        consumption: null,
        unitRate: null,
        amount: 0,
        rateSource: null,
        rateSourceId: null,
        rateEffectiveFrom: null,
      }),
    );

    const result = await recordMeterReadingService(LANDLORD_ID, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-06",
      value: 100,
      isInitial: true,
    });

    expect(result.amount).toBe(0);
    expect(result.consumption).toBeNull();
    expect(mocks.resolveElectricityRate).not.toHaveBeenCalled();
    expect(mocks.createMeterReading).toHaveBeenCalledWith(
      expect.objectContaining({
        isInitial: true,
        previousValue: null,
        consumption: null,
        amount: 0,
      }),
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "meter_reading.created" }),
    );
  });

  it("US-METER-01: rejects a duplicate reading for the same room/utility/period", async () => {
    mocks.findActiveReading.mockResolvedValue(baseRow());

    await expect(
      recordMeterReadingService(LANDLORD_ID, ROOM_ID, {
        utilityType: "Electricity",
        billingPeriod: "2026-07",
        value: 150,
        isInitial: false,
      }),
    ).rejects.toMatchObject({ status: 409, code: "CONFLICT" });

    expect(mocks.createMeterReading).not.toHaveBeenCalled();
  });

  it("US-METER-01: rejects recording a water reading when the property bills water flat", async () => {
    mocks.resolveWaterRate.mockResolvedValue({
      utilityType: "Water",
      source: "landlord",
      sourceId: "77777777-7777-4777-8777-777777777777",
      sourceReference: null,
      effectiveFrom: "2026-07-01",
      method: "Flat",
      ratePerM3: null,
      flatAmountPerTenant: 100000,
    });

    await expect(
      recordMeterReadingService(LANDLORD_ID, ROOM_ID, {
        utilityType: "Water",
        billingPeriod: "2026-07",
        value: 10,
        isInitial: true,
      }),
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE" });

    expect(mocks.createMeterReading).not.toHaveBeenCalled();
  });

  it("US-METER-02: rejects when no preceding baseline reading exists", async () => {
    mocks.findPreviousReading.mockResolvedValue(null);

    await expect(
      recordMeterReadingService(LANDLORD_ID, ROOM_ID, {
        utilityType: "Electricity",
        billingPeriod: "2026-07",
        value: 150,
        isInitial: false,
      }),
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE" });

    expect(mocks.createMeterReading).not.toHaveBeenCalled();
  });

  it("US-METER-02: rejects a current reading lower than the previous reading", async () => {
    mocks.findPreviousReading.mockResolvedValue(
      baseRow({ value: "200.0000" }),
    );

    await expect(
      recordMeterReadingService(LANDLORD_ID, ROOM_ID, {
        utilityType: "Electricity",
        billingPeriod: "2026-07",
        value: 150,
        isInitial: false,
      }),
    ).rejects.toMatchObject({
      status: 422,
      code: "UNPROCESSABLE",
      fields: [{ field: "value" }],
    });

    expect(mocks.createMeterReading).not.toHaveBeenCalled();
  });

  it("US-METER-02: calculates electricity consumption and charge from the effective rate", async () => {
    mocks.findPreviousReading.mockResolvedValue(
      baseRow({ value: "100.0000" }),
    );

    const result = await recordMeterReadingService(LANDLORD_ID, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-07",
      value: 150,
      isInitial: false,
    });

    expect(mocks.createMeterReading).toHaveBeenCalledWith(
      expect.objectContaining({
        consumption: "50.0000",
        unitRate: 3500,
        amount: 175000,
      }),
    );
    expect(result.amount).toBe(175000);
  });

  it("US-METER-02: calculates metered-water consumption using the water rate, not electricity", async () => {
    mocks.findPreviousReading.mockResolvedValue(
      baseRow({ utilityType: "Water", value: "10.0000" }),
    );

    await recordMeterReadingService(LANDLORD_ID, ROOM_ID, {
      utilityType: "Water",
      billingPeriod: "2026-07",
      value: 15,
      isInitial: false,
    });

    expect(mocks.resolveWaterRate).toHaveBeenCalled();
    expect(mocks.createMeterReading).toHaveBeenCalledWith(
      expect.objectContaining({
        consumption: "5.0000",
        unitRate: 15000,
        amount: 75000,
      }),
    );
  });

  it("cannot record a reading for a room owned by another landlord", async () => {
    mocks.assertRoomOwned.mockRejectedValue(
      Object.assign(new Error("Room not found."), {
        status: 404,
        code: "NOT_FOUND",
      }),
    );

    await expect(
      recordMeterReadingService(OTHER_LANDLORD_ID, ROOM_ID, {
        utilityType: "Electricity",
        billingPeriod: "2026-07",
        value: 150,
        isInitial: false,
      }),
    ).rejects.toMatchObject({ status: 404 });

    expect(mocks.createMeterReading).not.toHaveBeenCalled();
  });
});

describe("correctMeterReadingService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockImplementation(
      async (callback: (executor: unknown) => unknown) => callback(mocks.trx),
    );
    mocks.findMeterReadingById.mockResolvedValue(baseRow());
    mocks.assertRoomOwned.mockResolvedValue({
      propertyId: PROPERTY_ID,
      locality: "Ho Chi Minh City",
    });
    mocks.findActiveInvoiceForRoomPeriod.mockResolvedValue({
      id: "88888888-8888-4888-8888-888888888888",
      status: "Draft",
    });
    mocks.createMeterReading.mockResolvedValue(
      baseRow({ id: "99999999-9999-4999-8999-999999999998", value: "160.0000" }),
    );
    mocks.supersedeReading.mockResolvedValue(undefined);
    mocks.writeAudit.mockResolvedValue(undefined);
    mocks.recalculateDraftInvoice.mockResolvedValue(undefined);
  });

  it("US-METER-03: supersedes the original reading and inserts a corrected one", async () => {
    await correctMeterReadingService(LANDLORD_ID, READING_ID, 160);

    expect(mocks.supersedeReading).toHaveBeenCalledWith(
      READING_ID,
      expect.any(Date),
      mocks.trx,
    );
    expect(mocks.createMeterReading).toHaveBeenCalledWith(
      expect.objectContaining({
        value: "160.0000",
        previousValue: "100.0000",
        consumption: "60.0000",
        amount: 210000,
      }),
      mocks.trx,
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "meter_reading.corrected",
        beforeValue: expect.objectContaining({ correctionOf: null }),
        afterValue: expect.objectContaining({
          correctionOf: READING_ID,
          value: 160,
        }),
      }),
    );
  });

  it("US-METER-03: recalculates the linked draft invoice after correcting", async () => {
    await correctMeterReadingService(LANDLORD_ID, READING_ID, 160);

    expect(mocks.recalculateDraftInvoice).toHaveBeenCalledWith(
      ROOM_ID,
      "2026-07",
      LANDLORD_ID,
    );
  });

  it("US-METER-03 / PD-06: refuses to correct a reading whose invoice has already been sent", async () => {
    mocks.findActiveInvoiceForRoomPeriod.mockResolvedValue({
      id: "88888888-8888-4888-8888-888888888888",
      status: "Sent",
    });

    await expect(
      correctMeterReadingService(LANDLORD_ID, READING_ID, 160),
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE" });

    expect(mocks.createMeterReading).not.toHaveBeenCalled();
    expect(mocks.recalculateDraftInvoice).not.toHaveBeenCalled();
  });

  it("US-METER-03: refuses to correct a reading whose invoice has already been paid", async () => {
    mocks.findActiveInvoiceForRoomPeriod.mockResolvedValue({
      id: "88888888-8888-4888-8888-888888888888",
      status: "Paid",
    });

    await expect(
      correctMeterReadingService(LANDLORD_ID, READING_ID, 160),
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE" });

    expect(mocks.createMeterReading).not.toHaveBeenCalled();
  });

  it("US-METER-03: rejects a corrected value lower than the previous reading", async () => {
    await expect(
      correctMeterReadingService(LANDLORD_ID, READING_ID, 50),
    ).rejects.toMatchObject({
      status: 422,
      code: "UNPROCESSABLE",
      fields: [{ field: "value" }],
    });

    expect(mocks.createMeterReading).not.toHaveBeenCalled();
  });

  it("US-METER-03: refuses to correct an initial baseline reading", async () => {
    mocks.findMeterReadingById.mockResolvedValue(
      baseRow({ isInitial: true }),
    );

    await expect(
      correctMeterReadingService(LANDLORD_ID, READING_ID, 160),
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE" });

    expect(mocks.createMeterReading).not.toHaveBeenCalled();
  });

  it("returns 404 for a reading that does not exist", async () => {
    mocks.findMeterReadingById.mockResolvedValue(null);

    await expect(
      correctMeterReadingService(LANDLORD_ID, READING_ID, 160),
    ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
  });

  it("only the owning landlord can correct a reading", async () => {
    mocks.assertRoomOwned.mockRejectedValue(
      Object.assign(new Error("Room not found."), {
        status: 404,
        code: "NOT_FOUND",
      }),
    );

    await expect(
      correctMeterReadingService(OTHER_LANDLORD_ID, READING_ID, 160),
    ).rejects.toMatchObject({ status: 404 });

    expect(mocks.createMeterReading).not.toHaveBeenCalled();
  });
});
