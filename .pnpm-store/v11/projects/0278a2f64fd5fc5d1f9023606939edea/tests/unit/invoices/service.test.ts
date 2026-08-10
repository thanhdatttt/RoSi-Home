import { beforeEach, describe, expect, it, vi } from "vitest";

const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const TENANT_USER_ID = "44444444-4444-4444-8444-444444444444";
const PROPERTY_ID = "22222222-2222-4222-8222-222222222222";
const ROOM_ID = "55555555-5555-4555-8555-555555555555";
const LEASE_ID = "66666666-6666-4666-8666-666666666666";
const INVOICE_ID = "77777777-7777-4777-8777-777777777777";

const mocks = vi.hoisted(() => {
  const trx = { kind: "transaction" };
  return {
    trx,
    transaction: vi.fn(async (callback: (executor: unknown) => unknown) =>
      callback(trx),
    ),
    writeAudit: vi.fn(),
    // leases repository
    findActiveLeaseForRoomPeriod: vi.fn(),
    findActiveLeasesForPropertyPeriod: vi.fn(),
    countActiveLeasesForRoomPeriod: vi.fn(),
    findPropertiesWithActiveLeases: vi.fn(),
    // utilities
    resolveWaterRate: vi.fn(),
    // meters repository
    findActiveReading: vi.fn(),
    // charges repository
    findActiveSurchargesForPropertyPeriod: vi.fn(),
    // invoices repository
    assertPropertyOwned: vi.fn(),
    createInvoiceGenerationSkip: vi.fn(),
    createInvoiceWithLineItems: vi.fn(),
    deleteInvoiceLineItems: vi.fn(),
    findActiveInvoiceForRoomPeriod: vi.fn(),
    findExistingInvoice: vi.fn(),
    findInvoiceLineItems: vi.fn(),
    getInvoiceDetail: vi.fn(),
    insertInvoiceLineItems: vi.fn(),
    updateInvoice: vi.fn(),
    // fcm / notification plumbing
    sendToToken: vi.fn(),
    insertNotificationReturning: vi.fn(async () => [
      { title: "New invoice available", body: "body", linkRef: "invoices/x" },
    ]),
    selectDeviceTokensWhere: vi.fn(async () => []),
  };
});

vi.mock("../../../src/db/index.js", () => ({
  db: {
    transaction: mocks.transaction,
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: mocks.insertNotificationReturning,
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: mocks.selectDeviceTokensWhere,
      })),
    })),
  },
}));

vi.mock("../../../src/db/schema.js", () => ({
  notifications: { userId: "userId" },
  deviceTokens: { userId: "userId", fcmToken: "fcmToken" },
}));

vi.mock("../../../src/db/audit.js", () => ({
  writeAudit: mocks.writeAudit,
}));

vi.mock("../../../src/lib/fcm.js", () => ({
  sendToToken: mocks.sendToToken,
}));

vi.mock("../../../src/modules/leases/repository.js", () => ({
  findActiveLeaseForRoomPeriod: mocks.findActiveLeaseForRoomPeriod,
  findActiveLeasesForPropertyPeriod: mocks.findActiveLeasesForPropertyPeriod,
  countActiveLeasesForRoomPeriod: mocks.countActiveLeasesForRoomPeriod,
  findPropertiesWithActiveLeases: mocks.findPropertiesWithActiveLeases,
}));

vi.mock("../../../src/modules/utilities/rateResolver.js", () => ({
  resolveWaterRate: mocks.resolveWaterRate,
}));

vi.mock("../../../src/modules/meters/repository.js", () => ({
  findActiveReading: mocks.findActiveReading,
}));

vi.mock("../../../src/modules/charges/repository.js", () => ({
  findActiveSurchargesForPropertyPeriod:
    mocks.findActiveSurchargesForPropertyPeriod,
}));

vi.mock("../../../src/modules/invoices/repository.js", () => ({
  assertPropertyOwned: mocks.assertPropertyOwned,
  createInvoiceGenerationSkip: mocks.createInvoiceGenerationSkip,
  createInvoiceWithLineItems: mocks.createInvoiceWithLineItems,
  deleteInvoiceLineItems: mocks.deleteInvoiceLineItems,
  findActiveInvoiceForRoomPeriod: mocks.findActiveInvoiceForRoomPeriod,
  findExistingInvoice: mocks.findExistingInvoice,
  findInvoiceLineItems: mocks.findInvoiceLineItems,
  getInvoiceDetail: mocks.getInvoiceDetail,
  insertInvoiceLineItems: mocks.insertInvoiceLineItems,
  updateInvoice: mocks.updateInvoice,
}));

import {
  generateInvoicesForProperty,
  generateMonthlyInvoicesForAll,
  getInvoiceService,
  sendInvoiceService,
  recalculateDraftInvoice,
} from "../../../src/modules/invoices/service.js";

const leaseCtx = {
  leaseId: LEASE_ID,
  roomId: ROOM_ID,
  propertyId: PROPERTY_ID,
  locality: "Ho Chi Minh City",
  tenantInfoId: "88888888-8888-4888-8888-888888888888",
  tenantUserId: TENANT_USER_ID,
  agreedRent: 3000000,
};

const meteredWaterRate = {
  utilityType: "Water" as const,
  source: "landlord" as const,
  sourceId: "99999999-9999-4999-8999-999999999999",
  sourceReference: null,
  effectiveFrom: "2026-07-01",
  method: "Metered" as const,
  ratePerM3: 15000,
  flatAmountPerTenant: null,
};

const flatWaterRate = {
  utilityType: "Water" as const,
  source: "landlord" as const,
  sourceId: "99999999-9999-4999-8999-999999999999",
  sourceReference: null,
  effectiveFrom: "2026-07-01",
  method: "Flat" as const,
  ratePerM3: null,
  flatAmountPerTenant: 100000,
};

function elecReading(overrides: Record<string, unknown> = {}) {
  return {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    roomId: ROOM_ID,
    utilityType: "Electricity" as const,
    billingPeriod: "2026-07",
    value: "150.0000",
    isInitial: false,
    previousValue: "100.0000",
    consumption: "50.0000",
    unitRate: 3500,
    amount: 175000,
    rateSource: "landlord",
    rateSourceId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
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

function invoiceDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: INVOICE_ID,
    leaseId: LEASE_ID,
    roomId: ROOM_ID,
    billingPeriod: "2026-07",
    status: "Draft" as const,
    issueDate: "2026-07-01",
    dueDate: "2026-07-10",
    totalAmount: 3175000,
    sentBy: null,
    sentAt: null,
    createdAt: new Date("2026-07-05T00:00:00.000Z"),
    updatedAt: new Date("2026-07-05T00:00:00.000Z"),
    tenantInfoId: "88888888-8888-4888-8888-888888888888",
    agreedRent: 3000000,
    propertyId: PROPERTY_ID,
    landlordId: LANDLORD_ID,
    locality: "Ho Chi Minh City",
    propertyName: "Sunrise House",
    propertyAddress: "123 Le Loi",
    tenantUserId: TENANT_USER_ID,
    tenantFullName: "Nguyen Van A",
    tenantEmail: "tenant@example.com",
    tenantPhone: "0900000000",
    ...overrides,
  };
}

describe("generateInvoicesForProperty", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockImplementation(
      async (callback: (executor: unknown) => unknown) => callback(mocks.trx),
    );
    mocks.assertPropertyOwned.mockResolvedValue({ id: PROPERTY_ID });
    mocks.findActiveLeasesForPropertyPeriod.mockResolvedValue([leaseCtx]);
    mocks.findExistingInvoice.mockResolvedValue(null);
    mocks.resolveWaterRate.mockResolvedValue(meteredWaterRate);
    mocks.findActiveReading.mockResolvedValue(elecReading());
    mocks.findActiveSurchargesForPropertyPeriod.mockResolvedValue([]);
    mocks.createInvoiceWithLineItems.mockResolvedValue({
      id: INVOICE_ID,
      status: "Draft",
    });
    mocks.createInvoiceGenerationSkip.mockResolvedValue(undefined);
    mocks.writeAudit.mockResolvedValue(undefined);
  });

  it("US-INVOICE-01: generates a draft invoice with itemized rent + electricity + water", async () => {
    const result = await generateInvoicesForProperty(
      LANDLORD_ID,
      PROPERTY_ID,
      "2026-07",
    );

    expect(result).toEqual({ generated: 1, skipped: 0 });
    expect(mocks.createInvoiceWithLineItems).toHaveBeenCalledWith(
      expect.objectContaining({
        leaseId: LEASE_ID,
        roomId: ROOM_ID,
        billingPeriod: "2026-07",
        status: "Draft",
      }),
      expect.arrayContaining([
        expect.objectContaining({ type: "rent", amount: 3000000 }),
        expect.objectContaining({ type: "electricity", amount: 175000 }),
        expect.objectContaining({ type: "water" }),
      ]),
      mocks.trx,
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "invoice.generated" }),
      mocks.trx,
    );
  });

  it("US-INVOICE-01: does not create a duplicate invoice for an already-invoiced period", async () => {
    mocks.findExistingInvoice.mockResolvedValue({
      id: INVOICE_ID,
      status: "Draft",
    });

    const result = await generateInvoicesForProperty(
      LANDLORD_ID,
      PROPERTY_ID,
      "2026-07",
    );

    expect(result).toEqual({ generated: 0, skipped: 0 });
    expect(mocks.createInvoiceWithLineItems).not.toHaveBeenCalled();
  });

  it("US-INVOICE-01: skips (and records a reason) when the required electricity reading is missing", async () => {
    mocks.findActiveReading.mockResolvedValue(null);

    const result = await generateInvoicesForProperty(
      LANDLORD_ID,
      PROPERTY_ID,
      "2026-07",
    );

    expect(result).toEqual({ generated: 0, skipped: 1 });
    expect(mocks.createInvoiceGenerationSkip).toHaveBeenCalledWith(
      LEASE_ID,
      "2026-07",
      expect.stringContaining("electricity"),
      mocks.trx,
    );
    expect(mocks.createInvoiceWithLineItems).not.toHaveBeenCalled();
  });

  it("US-INVOICE-01: skips when a metered-water property is missing its water reading", async () => {
    mocks.findActiveReading.mockImplementation(
      async (_roomId: string, utilityType: string) =>
        utilityType === "Electricity" ? elecReading() : null,
    );

    const result = await generateInvoicesForProperty(
      LANDLORD_ID,
      PROPERTY_ID,
      "2026-07",
    );

    expect(result).toEqual({ generated: 0, skipped: 1 });
    expect(mocks.createInvoiceGenerationSkip).toHaveBeenCalledWith(
      LEASE_ID,
      "2026-07",
      expect.stringContaining("water"),
      mocks.trx,
    );
  });

  it("PD-04: flat-per-tenant water billing does not require a water meter reading", async () => {
    mocks.resolveWaterRate.mockResolvedValue(flatWaterRate);
    mocks.findActiveReading.mockImplementation(
      async (_roomId: string, utilityType: string) =>
        utilityType === "Electricity" ? elecReading() : null,
    );
    mocks.countActiveLeasesForRoomPeriod.mockResolvedValue(1);

    const result = await generateInvoicesForProperty(
      LANDLORD_ID,
      PROPERTY_ID,
      "2026-07",
    );

    expect(result).toEqual({ generated: 1, skipped: 0 });
    expect(mocks.createInvoiceWithLineItems).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({
          type: "water",
          description: "Water (flat)",
          amount: 100000,
        }),
      ]),
      mocks.trx,
    );
  });

  it("US-INVOICE-01: includes each active surcharge as its own named line item", async () => {
    mocks.findActiveSurchargesForPropertyPeriod.mockResolvedValue([
      {
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        propertyId: PROPERTY_ID,
        name: "Internet",
        monthlyAmount: 500000,
        effectiveFrom: "2026-01-01",
        effectiveTo: null,
        active: true,
      },
    ]);

    const result = await generateInvoicesForProperty(
      LANDLORD_ID,
      PROPERTY_ID,
      "2026-07",
    );

    expect(result).toEqual({ generated: 1, skipped: 0 });
    expect(mocks.createInvoiceWithLineItems).toHaveBeenCalledWith(
      expect.objectContaining({ totalAmount: 3000000 + 175000 + 175000 + 500000 }),
      expect.arrayContaining([
        expect.objectContaining({
          type: "surcharge",
          description: "Internet",
          amount: 500000,
        }),
      ]),
      mocks.trx,
    );
  });

  it("US-INVOICE-01: only the owning landlord can generate invoices for a property", async () => {
    mocks.assertPropertyOwned.mockRejectedValue(
      Object.assign(new Error("Property not found."), {
        status: 404,
        code: "NOT_FOUND",
      }),
    );

    await expect(
      generateInvoicesForProperty(LANDLORD_ID, PROPERTY_ID, "2026-07"),
    ).rejects.toMatchObject({ status: 404 });

    expect(mocks.createInvoiceWithLineItems).not.toHaveBeenCalled();
  });

  it("rejects an invalid billing period before touching the database", async () => {
    await expect(
      generateInvoicesForProperty(LANDLORD_ID, PROPERTY_ID, "not-a-period"),
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE" });

    expect(mocks.findActiveLeasesForPropertyPeriod).not.toHaveBeenCalled();
  });
});

describe("generateMonthlyInvoicesForAll", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockImplementation(
      async (callback: (executor: unknown) => unknown) => callback(mocks.trx),
    );
    mocks.assertPropertyOwned.mockResolvedValue({ id: PROPERTY_ID });
    mocks.findPropertiesWithActiveLeases.mockResolvedValue([
      { propertyId: PROPERTY_ID, landlordId: LANDLORD_ID },
    ]);
    mocks.findActiveLeasesForPropertyPeriod.mockResolvedValue([leaseCtx]);
    mocks.findExistingInvoice.mockResolvedValue(null);
    mocks.resolveWaterRate.mockResolvedValue(meteredWaterRate);
    mocks.findActiveReading.mockResolvedValue(elecReading());
    mocks.findActiveSurchargesForPropertyPeriod.mockResolvedValue([]);
    mocks.createInvoiceWithLineItems.mockResolvedValue({
      id: INVOICE_ID,
      status: "Draft",
    });
    mocks.writeAudit.mockResolvedValue(undefined);
  });

  it("US-INVOICE-01: the scheduled job evaluates every property with an active lease", async () => {
    const result = await generateMonthlyInvoicesForAll();

    expect(result.properties).toBe(1);
    expect(result.generated).toBe(1);
    expect(result.skipped).toBe(0);
  });
});

describe("getInvoiceService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getInvoiceDetail.mockResolvedValue(invoiceDetail());
    mocks.findInvoiceLineItems.mockResolvedValue([]);
  });

  it("US-INVOICE-02: a landlord can view an invoice in an owned property", async () => {
    const view = await getInvoiceService(LANDLORD_ID, "Landlord", INVOICE_ID);
    expect(view.id).toBe(INVOICE_ID);
  });

  it("US-INVOICE-02: an unrelated landlord cannot access the invoice by id", async () => {
    await expect(
      getInvoiceService("zzzzzzzz-zzzz-4zzz-8zzz-zzzzzzzzzzzz", "Landlord", INVOICE_ID),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("US-INVOICE-02: a Draft invoice is landlord-only and hidden from the tenant", async () => {
    await expect(
      getInvoiceService(TENANT_USER_ID, "Tenant", INVOICE_ID),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("US-INVOICE-02: the assigned tenant can view a Sent invoice", async () => {
    mocks.getInvoiceDetail.mockResolvedValue(
      invoiceDetail({ status: "Sent" }),
    );

    const view = await getInvoiceService(TENANT_USER_ID, "Tenant", INVOICE_ID);
    expect(view.status).toBe("Sent");
  });

  it("US-INVOICE-02: an unrelated tenant cannot access another tenant's invoice", async () => {
    await expect(
      getInvoiceService("zzzzzzzz-zzzz-4zzz-8zzz-zzzzzzzzzzzz", "Tenant", INVOICE_ID),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("returns 404 for a non-existent invoice", async () => {
    mocks.getInvoiceDetail.mockResolvedValue(null);

    await expect(
      getInvoiceService(LANDLORD_ID, "Landlord", INVOICE_ID),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe("sendInvoiceService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getInvoiceDetail.mockResolvedValue(invoiceDetail());
    mocks.updateInvoice.mockResolvedValue({
      ...invoiceDetail(),
      status: "Sent",
    });
    mocks.findInvoiceLineItems.mockResolvedValue([]);
    mocks.writeAudit.mockResolvedValue(undefined);
    mocks.insertNotificationReturning.mockResolvedValue([
      { title: "New invoice available", body: "body", linkRef: `invoices/${INVOICE_ID}` },
    ]);
    mocks.selectDeviceTokensWhere.mockResolvedValue([]);
  });

  it("US-INVOICE-04: sends a Draft invoice exactly once and records sender/time", async () => {
    // sendInvoiceService reads the invoice once to authorize/validate, then
    // again after the update to build the returned view.
    mocks.getInvoiceDetail
      .mockResolvedValueOnce(invoiceDetail())
      .mockResolvedValueOnce(invoiceDetail({ status: "Sent" }));

    const result = await sendInvoiceService(LANDLORD_ID, INVOICE_ID);

    expect(result.status).toBe("Sent");
    expect(mocks.updateInvoice).toHaveBeenCalledWith(
      INVOICE_ID,
      expect.objectContaining({ status: "Sent", sentBy: LANDLORD_ID }),
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "invoice.sent" }),
    );
  });

  it("US-INVOICE-04: notifies the assigned tenant after sending", async () => {
    mocks.getInvoiceDetail
      .mockResolvedValueOnce(invoiceDetail())
      .mockResolvedValueOnce(invoiceDetail({ status: "Sent" }));

    await sendInvoiceService(LANDLORD_ID, INVOICE_ID);

    expect(mocks.insertNotificationReturning).toHaveBeenCalled();
  });

  it("US-INVOICE-04: only a Draft invoice can be sent", async () => {
    mocks.getInvoiceDetail.mockResolvedValue(
      invoiceDetail({ status: "Sent" }),
    );

    await expect(
      sendInvoiceService(LANDLORD_ID, INVOICE_ID),
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE" });

    expect(mocks.updateInvoice).not.toHaveBeenCalled();
  });

  it("US-INVOICE-04: an unrelated landlord cannot send another landlord's invoice", async () => {
    await expect(
      sendInvoiceService("zzzzzzzz-zzzz-4zzz-8zzz-zzzzzzzzzzzz", INVOICE_ID),
    ).rejects.toMatchObject({ status: 404 });

    expect(mocks.updateInvoice).not.toHaveBeenCalled();
  });
});

describe("recalculateDraftInvoice", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockImplementation(
      async (callback: (executor: unknown) => unknown) => callback(mocks.trx),
    );
    mocks.findActiveInvoiceForRoomPeriod.mockResolvedValue({
      id: INVOICE_ID,
      status: "Draft",
    });
    mocks.findActiveLeaseForRoomPeriod.mockResolvedValue(leaseCtx);
    mocks.resolveWaterRate.mockResolvedValue(meteredWaterRate);
    mocks.findActiveReading.mockResolvedValue(elecReading());
    mocks.findActiveSurchargesForPropertyPeriod.mockResolvedValue([]);
    mocks.deleteInvoiceLineItems.mockResolvedValue(undefined);
    mocks.insertInvoiceLineItems.mockResolvedValue(undefined);
    mocks.updateInvoice.mockResolvedValue(undefined);
    mocks.writeAudit.mockResolvedValue(undefined);
  });

  it("US-METER-03: recomputes and replaces the draft invoice's line items", async () => {
    await recalculateDraftInvoice(ROOM_ID, "2026-07", LANDLORD_ID);

    expect(mocks.deleteInvoiceLineItems).toHaveBeenCalledWith(
      INVOICE_ID,
      mocks.trx,
    );
    expect(mocks.insertInvoiceLineItems).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: "rent", invoiceId: INVOICE_ID }),
      ]),
      mocks.trx,
    );
    // rent 3,000,000 + electricity 175,000 + metered water 175,000
    // (the mocked findActiveReading returns the same reading shape for both
    // utility types in this test).
    expect(mocks.updateInvoice).toHaveBeenCalledWith(
      INVOICE_ID,
      expect.objectContaining({ totalAmount: 3350000 }),
      mocks.trx,
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "invoice.recalculated" }),
      mocks.trx,
    );
  });

  it("PD-06: does nothing when the invoice has already moved past Draft", async () => {
    mocks.findActiveInvoiceForRoomPeriod.mockResolvedValue({
      id: INVOICE_ID,
      status: "Sent",
    });

    await recalculateDraftInvoice(ROOM_ID, "2026-07", LANDLORD_ID);

    expect(mocks.deleteInvoiceLineItems).not.toHaveBeenCalled();
    expect(mocks.updateInvoice).not.toHaveBeenCalled();
  });

  it("does nothing when there is no invoice yet for the room/period", async () => {
    mocks.findActiveInvoiceForRoomPeriod.mockResolvedValue(null);

    await recalculateDraftInvoice(ROOM_ID, "2026-07", LANDLORD_ID);

    expect(mocks.deleteInvoiceLineItems).not.toHaveBeenCalled();
  });
});
