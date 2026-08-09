import type { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const TEST_JWT_SECRET = "payment-contract-test-secret";
const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const TENANT_ID = "44444444-4444-4444-8444-444444444444";
const INVOICE_ID = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";

const invoicePaymentMocks = vi.hoisted(() => ({
  getVietqrService: vi.fn(),
  uploadPaymentProofService: vi.fn(),
  confirmPaymentService: vi.fn(),
  sendManualReminderService: vi.fn(),
}));

const paymentsMocks = vi.hoisted(() => ({
  getPaymentConfig: vi.fn(),
  upsertPaymentConfig: vi.fn(),
  getPendingProofs: vi.fn(),
  getPaymentHistory: vi.fn(),
}));

vi.mock("../../src/modules/invoices/paymentService.js", () => invoicePaymentMocks);
vi.mock("../../src/modules/payments/service.js", () => ({
  PaymentService: paymentsMocks
}));

function token(sub: string, role: "Landlord" | "Tenant"): string {
  return jwt.sign({ sub, role, mustChangePassword: false }, TEST_JWT_SECRET, {
    expiresIn: "1h",
  });
}

describe("Payments & Invoices HTTP contract", () => {
  let app: Express;
  let landlordToken: string;
  let tenantToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.DATABASE_URL = "postgres://test:test@127.0.0.1:1/contract_tests";
    const module = await import("../../src/app.js");
    app = module.createApp();
    landlordToken = token(LANDLORD_ID, "Landlord");
    tenantToken = token(TENANT_ID, "Tenant");
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("US-VIETQR-01 — Payment config", () => {
    it("allows landlord to update payment config", async () => {
      paymentsMocks.upsertPaymentConfig.mockResolvedValue({ bankCode: "VCB" });
      
      const response = await request(app)
        .put("/api/v1/payment-config")
        .set("Authorization", `Bearer ${landlordToken}`)
<<<<<<< HEAD
        .send({ bankCode: "VCB", accountNumber: "12345", accountHolderName: "AN" })
        .expect(200);

      expect(response.body.data).toEqual({ bankCode: "VCB" });
      expect(paymentsMocks.upsertPaymentConfig).toHaveBeenCalledWith(LANDLORD_ID, { bankCode: "VCB", accountNumber: "12345", accountHolderName: "AN" });
=======
        .send({ bankCode: "VCB", accountNumber: "123", accountHolderName: "A" })
        .expect(200);

      expect(response.body.data).toEqual({ bankCode: "VCB" });
      expect(paymentsMocks.upsertPaymentConfig).toHaveBeenCalledWith(LANDLORD_ID, { bankCode: "VCB", accountNumber: "123", accountHolderName: "A" });
>>>>>>> origin/main
    });
  });

  describe("US-VIETQR-02 — Get VietQR", () => {
    it("returns VietQR payload for an invoice", async () => {
      invoicePaymentMocks.getVietqrService.mockResolvedValue({
        payload: "000201...",
        imageUrl: "data:image/png;base64,...",
        amount: 5000000,
        description: "Rent"
      });

      const response = await request(app)
        .get(`/api/v1/invoices/${INVOICE_ID}/vietqr`)
        .set("Authorization", `Bearer ${tenantToken}`)
        .expect(200);

      expect(response.body.data.payload).toBe("000201...");
      expect(invoicePaymentMocks.getVietqrService).toHaveBeenCalledWith(TENANT_ID, "Tenant", INVOICE_ID);
    });
  });

  describe("US-PAYMENT-01 — Upload payment proof", () => {
    it("allows tenant to upload payment proof", async () => {
      invoicePaymentMocks.uploadPaymentProofService.mockResolvedValue({ status: "Pending" });

      const response = await request(app)
        .post(`/api/v1/invoices/${INVOICE_ID}/payment-proofs`)
        .set("Authorization", `Bearer ${tenantToken}`)
<<<<<<< HEAD
        .attach(
          "proof",
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]),
          "test.png",
        )
=======
        .attach("proof", Buffer.from("fake-image"), "test.png")
>>>>>>> origin/main
        .expect(201);

      expect(response.body.data.status).toBe("Pending");
      expect(invoicePaymentMocks.uploadPaymentProofService).toHaveBeenCalled();
    });

    it("rejects non-tenants from uploading", async () => {
      await request(app)
        .post(`/api/v1/invoices/${INVOICE_ID}/payment-proofs`)
        .set("Authorization", `Bearer ${landlordToken}`)
        .attach("proof", Buffer.from("fake"), "test.png")
        .expect(403); // Forbidden from requireRole middleware
    });
  });

  describe("US-PAYMENT-02 — Confirm payment", () => {
    it("allows landlord to confirm payment", async () => {
      invoicePaymentMocks.confirmPaymentService.mockResolvedValue({ id: "pay-1" });

      const response = await request(app)
        .post(`/api/v1/invoices/${INVOICE_ID}/confirm-payment`)
        .set("Authorization", `Bearer ${landlordToken}`)
        .expect(200);

      expect(response.body.data.id).toBe("pay-1");
      expect(invoicePaymentMocks.confirmPaymentService).toHaveBeenCalledWith(LANDLORD_ID, INVOICE_ID);
    });
  });

  describe("US-REMINDER-02 — Manual reminder", () => {
    it("allows landlord to send manual reminder", async () => {
      invoicePaymentMocks.sendManualReminderService.mockResolvedValue({ success: true });

      const response = await request(app)
        .post(`/api/v1/invoices/${INVOICE_ID}/remind`)
        .set("Authorization", `Bearer ${landlordToken}`)
        .expect(200);

      expect(response.body.data.success).toBe(true);
      expect(invoicePaymentMocks.sendManualReminderService).toHaveBeenCalledWith(LANDLORD_ID, INVOICE_ID);
    });
  });
});
