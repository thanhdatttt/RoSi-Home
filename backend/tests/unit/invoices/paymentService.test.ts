import { describe, it, expect, vi, beforeEach } from "vitest";
import { getVietqrService, uploadPaymentProofService, confirmPaymentService, sendManualReminderService } from "../../../src/modules/invoices/paymentService.js";
import { getInvoiceDetail } from "../../../src/modules/invoices/repository.js";
import { PaymentRepository } from "../../../src/modules/payments/repository.js";
import { uploadPaymentProof } from "../../../src/lib/storage.js";
import { generateVietQR } from "../../../src/lib/vietqr.js";
import { sendNotification } from "../../../src/modules/notifications/service.js";
import { db } from "../../../src/db/index.js";
import { writeAudit } from "../../../src/db/audit.js";
import { NotFoundError, UnprocessableError } from "../../../src/lib/errors.js";

vi.mock("../../../src/modules/invoices/repository.js", () => ({
  getInvoiceDetail: vi.fn(),
}));
vi.mock("../../../src/modules/payments/repository.js", () => ({
  PaymentRepository: {
    getPaymentConfig: vi.fn(),
    createPayment: vi.fn(),
    getExistingPayment: vi.fn(),
  },
}));
vi.mock("../../../src/lib/storage.js", () => ({
  uploadPaymentProof: vi.fn(),
}));
vi.mock("../../../src/lib/vietqr.js", () => ({
  generateVietQR: vi.fn(),
}));
vi.mock("../../../src/modules/notifications/service.js", () => ({
  sendNotification: vi.fn(),
}));
vi.mock("../../../src/db/audit.js", () => ({
  writeAudit: vi.fn(),
}));
vi.mock("../../../src/db/index.js", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([{ id: "tenantInfo-1" }]),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: "proof-1", status: "Pending" }]),
      })),
    })),
  },
}));

describe("paymentService unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const invoiceMock = {
    id: "inv-1",
    landlordId: "landlord-1",
    tenantUserId: "tenant-1",
    status: "Sent",
    totalAmount: 5000000,
    propertyName: "P1",
    roomId: "12345678-abcd",
    billingPeriod: "2025-01",
    tenantFullName: "Tenant A",
  };

  describe("getVietqrService", () => {
    it("generates VietQR for valid invoice", async () => {
      vi.mocked(getInvoiceDetail).mockResolvedValue(invoiceMock as any);
      vi.mocked(PaymentRepository.getPaymentConfig).mockResolvedValue({
        bankCode: "VCB",
        accountNumber: "123",
        accountHolderName: "A",
      } as any);
      vi.mocked(generateVietQR).mockResolvedValue({ payload: "payload1", imageUrl: "img1" });

      const res = await getVietqrService("tenant-1", "Tenant", "inv-1");
      expect(res.payload).toBe("payload1");
    });

    it("throws UnprocessableError if config missing", async () => {
      vi.mocked(getInvoiceDetail).mockResolvedValue(invoiceMock as any);
      vi.mocked(PaymentRepository.getPaymentConfig).mockResolvedValue(null);

      await expect(getVietqrService("tenant-1", "Tenant", "inv-1")).rejects.toThrow(UnprocessableError);
    });
  });

  describe("uploadPaymentProofService", () => {
    it("uploads proof and creates record", async () => {
      vi.mocked(getInvoiceDetail).mockResolvedValue(invoiceMock as any);
      vi.mocked(uploadPaymentProof).mockResolvedValue({ objectPath: "path", fileUrl: "url" });

      const res = await uploadPaymentProofService("tenant-1", "inv-1", Buffer.from("test"), "image/png");
      expect(res.id).toBe("proof-1");
      expect(sendNotification).toHaveBeenCalled();
    });
  });

  describe("confirmPaymentService", () => {
    it("creates payment and writes audit", async () => {
      vi.mocked(getInvoiceDetail).mockResolvedValue(invoiceMock as any);
      vi.mocked(PaymentRepository.createPayment).mockResolvedValue({ id: "pay-1" } as any);

      const res = await confirmPaymentService("landlord-1", "inv-1");
      expect(res.id).toBe("pay-1");
      expect(writeAudit).toHaveBeenCalled();
    });
  });

  describe("sendManualReminderService", () => {
    it("sends notification and writes audit", async () => {
      vi.mocked(getInvoiceDetail).mockResolvedValue(invoiceMock as any);
      
      const res = await sendManualReminderService("landlord-1", "inv-1");
      expect(res.success).toBe(true);
      expect(sendNotification).toHaveBeenCalled();
      expect(writeAudit).toHaveBeenCalled();
    });
  });
});
