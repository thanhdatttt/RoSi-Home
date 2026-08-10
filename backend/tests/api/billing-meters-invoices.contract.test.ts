import type { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, UnprocessableError } from "../../src/lib/errors.js";

const TEST_JWT_SECRET = "api-contract-test-secret";
const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const TENANT_ID = "44444444-4444-4444-8444-444444444444";
const ROOM_ID = "22222222-2222-4222-8222-222222222222";
const PROPERTY_ID = "55555555-5555-4555-8555-555555555555";
const READING_ID = "66666666-6666-4666-8666-666666666666";
const INVOICE_ID = "77777777-7777-4777-8777-777777777777";

const mocks = vi.hoisted(() => ({
  recordMeterReadingService: vi.fn(),
  correctMeterReadingService: vi.fn(),
  getInvoiceService: vi.fn(),
  sendInvoiceService: vi.fn(),
  generateInvoicesForProperty: vi.fn(),
  generateInvoicePdf: vi.fn(),
}));

vi.mock("../../src/modules/meters/service.js", () => ({
  recordMeterReadingService: mocks.recordMeterReadingService,
  correctMeterReadingService: mocks.correctMeterReadingService,
}));

vi.mock("../../src/modules/invoices/service.js", () => ({
  getInvoiceService: mocks.getInvoiceService,
  sendInvoiceService: mocks.sendInvoiceService,
  generateInvoicesForProperty: mocks.generateInvoicesForProperty,
}));

vi.mock("../../src/lib/invoicePdf.js", () => ({
  generateInvoicePdf: mocks.generateInvoicePdf,
}));

function token(sub: string, role: "Landlord" | "Tenant"): string {
  return jwt.sign({ sub, role, mustChangePassword: false }, TEST_JWT_SECRET, {
    expiresIn: "1h",
  });
}

const meterReadingView = {
  id: READING_ID,
  roomId: ROOM_ID,
  utilityType: "Electricity" as const,
  billingPeriod: "2026-07",
  value: 150,
  isInitial: false,
  previousValue: 100,
  consumption: 50,
  unitRate: 3500,
  amount: 175000,
  rateSource: "landlord",
  rateSourceId: "88888888-8888-4888-8888-888888888888",
  rateSourceReference: null,
  rateEffectiveFrom: "2026-07-01",
  locality: "Ho Chi Minh City",
  tenantCount: null,
  recordedBy: LANDLORD_ID,
  createdAt: "2026-07-05T00:00:00.000Z",
};

const invoiceView = {
  id: INVOICE_ID,
  leaseId: "99999999-9999-4999-8999-999999999999",
  roomId: ROOM_ID,
  billingPeriod: "2026-07",
  status: "Draft" as const,
  issueDate: "2026-07-01",
  dueDate: "2026-07-10",
  totalAmount: 3175000,
  sentBy: null,
  sentAt: null,
  createdAt: "2026-07-05T00:00:00.000Z",
  updatedAt: "2026-07-05T00:00:00.000Z",
  lineItems: [],
};

describe("Meters + Invoices HTTP contract", () => {
  let app: Express;
  let landlordToken: string;
  let tenantToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.DATABASE_URL =
      "postgres://test:test@127.0.0.1:1/contract_tests";
    const module = await import("../../src/app.js");
    app = module.createApp();
    landlordToken = token(LANDLORD_ID, "Landlord");
    tenantToken = token(TENANT_ID, "Tenant");
  });

  beforeEach(() => {
    mocks.recordMeterReadingService.mockResolvedValue(meterReadingView);
    mocks.correctMeterReadingService.mockResolvedValue({
      ...meterReadingView,
      value: 160,
    });
    mocks.getInvoiceService.mockResolvedValue(invoiceView);
    mocks.sendInvoiceService.mockResolvedValue({
      ...invoiceView,
      status: "Sent",
    });
    mocks.generateInvoicesForProperty.mockResolvedValue({
      generated: 1,
      skipped: 0,
    });
    mocks.generateInvoicePdf.mockResolvedValue(new Uint8Array([1, 2, 3]));
  });

  // --- Meters -------------------------------------------------------------

  it("US-METER-01/02: rejects an unauthenticated meter-reading request", async () => {
    const response = await request(app)
      .post(`/api/v1/rooms/${ROOM_ID}/meter-readings`)
      .send({ utilityType: "Electricity", billingPeriod: "2026-07", value: 150 })
      .expect(401);

    expect(response.body.error).toMatchObject({ code: "UNAUTHENTICATED" });
    expect(mocks.recordMeterReadingService).not.toHaveBeenCalled();
  });

  it("US-METER-01/02: rejects a Tenant recording a meter reading", async () => {
    const response = await request(app)
      .post(`/api/v1/rooms/${ROOM_ID}/meter-readings`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ utilityType: "Electricity", billingPeriod: "2026-07", value: 150 })
      .expect(403);

    expect(response.body.error).toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.recordMeterReadingService).not.toHaveBeenCalled();
  });

  it("US-METER-01/02: rejects malformed input before calling the service", async () => {
    const response = await request(app)
      .post(`/api/v1/rooms/${ROOM_ID}/meter-readings`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ utilityType: "Gas", billingPeriod: "2026-07", value: 150 })
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.recordMeterReadingService).not.toHaveBeenCalled();
  });

  it("US-METER-01/02: records a meter reading and returns the success envelope", async () => {
    const body = {
      utilityType: "Electricity",
      billingPeriod: "2026-07",
      value: 150,
      isInitial: false,
    };

    const response = await request(app)
      .post(`/api/v1/rooms/${ROOM_ID}/meter-readings`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send(body)
      .expect(201);

    expect(response.body).toEqual({ data: meterReadingView });
    expect(mocks.recordMeterReadingService).toHaveBeenCalledWith(
      LANDLORD_ID,
      ROOM_ID,
      body,
    );
  });

  it("US-METER-01: maps a duplicate reading to the 409 error envelope", async () => {
    mocks.recordMeterReadingService.mockRejectedValue(
      new ConflictError(
        "A reading for this room, utility, and billing period already exists.",
      ),
    );

    const response = await request(app)
      .post(`/api/v1/rooms/${ROOM_ID}/meter-readings`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ utilityType: "Electricity", billingPeriod: "2026-07", value: 150 })
      .expect(409);

    expect(response.body.error).toMatchObject({ code: "CONFLICT" });
  });

  it("US-METER-03: corrects a reading and returns the success envelope", async () => {
    const response = await request(app)
      .post(`/api/v1/meter-readings/${READING_ID}/correct`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ value: 160 })
      .expect(200);

    expect(response.body.data).toMatchObject({ value: 160 });
    expect(mocks.correctMeterReadingService).toHaveBeenCalledWith(
      LANDLORD_ID,
      READING_ID,
      160,
    );
  });

  it("US-METER-03/PD-06: maps a correction on a Sent invoice to the 422 error envelope", async () => {
    mocks.correctMeterReadingService.mockRejectedValue(
      new UnprocessableError(
        "This reading cannot be corrected because its invoice has already been sent or paid.",
      ),
    );

    const response = await request(app)
      .post(`/api/v1/meter-readings/${READING_ID}/correct`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ value: 160 })
      .expect(422);

    expect(response.body.error).toMatchObject({ code: "UNPROCESSABLE" });
  });

  it("rejects a negative corrected value before calling the service", async () => {
    const response = await request(app)
      .post(`/api/v1/meter-readings/${READING_ID}/correct`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ value: -5 })
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.correctMeterReadingService).not.toHaveBeenCalled();
  });

  // --- Invoices -------------------------------------------------------------

  it("US-INVOICE-02: a Tenant can view an invoice through the standard envelope", async () => {
    const response = await request(app)
      .get(`/api/v1/invoices/${INVOICE_ID}`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(200);

    expect(response.body).toEqual({ data: invoiceView });
    expect(mocks.getInvoiceService).toHaveBeenCalledWith(
      TENANT_ID,
      "Tenant",
      INVOICE_ID,
    );
  });

  it("US-INVOICE-02: rejects an unauthenticated invoice view", async () => {
    const response = await request(app)
      .get(`/api/v1/invoices/${INVOICE_ID}`)
      .expect(401);

    expect(response.body.error).toMatchObject({ code: "UNAUTHENTICATED" });
  });

  it("US-INVOICE-03: downloads a PDF with the correct content type and filename", async () => {
    const response = await request(app)
      .get(`/api/v1/invoices/${INVOICE_ID}/pdf`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.headers["content-disposition"]).toContain(
      `invoice-${invoiceView.billingPeriod}-${invoiceView.id}.pdf`,
    );
    expect(mocks.generateInvoicePdf).toHaveBeenCalledWith(invoiceView);
  });

  it("US-INVOICE-04: only a Landlord may send an invoice", async () => {
    const response = await request(app)
      .post(`/api/v1/invoices/${INVOICE_ID}/send`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(403);

    expect(response.body.error).toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.sendInvoiceService).not.toHaveBeenCalled();
  });

  it("US-INVOICE-04: sends a draft invoice through the standard envelope", async () => {
    const response = await request(app)
      .post(`/api/v1/invoices/${INVOICE_ID}/send`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(response.body.data).toMatchObject({ status: "Sent" });
    expect(mocks.sendInvoiceService).toHaveBeenCalledWith(
      LANDLORD_ID,
      INVOICE_ID,
    );
  });

  it("US-INVOICE-04: maps sending a non-Draft invoice to the 422 error envelope", async () => {
    mocks.sendInvoiceService.mockRejectedValue(
      new UnprocessableError("Only a draft invoice can be sent."),
    );

    const response = await request(app)
      .post(`/api/v1/invoices/${INVOICE_ID}/send`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(422);

    expect(response.body.error).toMatchObject({ code: "UNPROCESSABLE" });
  });

  it("US-INVOICE-01: only a Landlord may trigger invoice generation for a property", async () => {
    const response = await request(app)
      .post(`/api/v1/properties/${PROPERTY_ID}/invoices/generate`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(403);

    expect(response.body.error).toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.generateInvoicesForProperty).not.toHaveBeenCalled();
  });

  it("US-INVOICE-01: triggers generation for a property and returns counts", async () => {
    const response = await request(app)
      .post(`/api/v1/properties/${PROPERTY_ID}/invoices/generate`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send()
      .query({ period: "2026-07" })
      .expect(200);

    expect(response.body).toEqual({ data: { generated: 1, skipped: 0 } });
    expect(mocks.generateInvoicesForProperty).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
      "2026-07",
    );
  });

  it("rejects an invalid billing period query before calling the service", async () => {
    const response = await request(app)
      .post(`/api/v1/properties/${PROPERTY_ID}/invoices/generate`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .query({ period: "not-a-period" })
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.generateInvoicesForProperty).not.toHaveBeenCalled();
  });
});
