import { beforeEach, describe, expect, it, vi } from "vitest";

import { PaymentService } from "../../../src/modules/payments/service.js";
import { PaymentRepository } from "../../../src/modules/payments/repository.js";
import { UnprocessableError } from "../../../src/lib/errors.js";

vi.mock("../../../src/modules/payments/repository.js", () => ({
  PaymentRepository: {
    upsertPaymentConfig: vi.fn(),
  },
}));
vi.mock("../../../src/db/index.js", () => ({ db: {} }));
vi.mock("../../../src/lib/storage.js", () => ({
  createSignedPaymentProofUrl: vi.fn(),
}));

describe("PaymentService.upsertPaymentConfig", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normalizes a supported bank and account before persistence", async () => {
    vi.mocked(PaymentRepository.upsertPaymentConfig).mockResolvedValue({
      bankCode: "VCB",
    } as never);

    await PaymentService.upsertPaymentConfig("landlord-1", {
      bankCode: " vcb ",
      accountNumber: " ab123 ",
      accountHolderName: " Nguyen Van A ",
    });

    expect(PaymentRepository.upsertPaymentConfig).toHaveBeenCalledWith(
      "landlord-1",
      {
        bankCode: "VCB",
        accountNumber: "AB123",
        accountHolderName: "Nguyen Van A",
      },
    );
  });

  it("rejects an unsupported bank without persisting a fallback", async () => {
    await expect(
      PaymentService.upsertPaymentConfig("landlord-1", {
        bankCode: "UNKNOWN",
        accountNumber: "12345",
        accountHolderName: "A B",
      }),
    ).rejects.toBeInstanceOf(UnprocessableError);
    expect(PaymentRepository.upsertPaymentConfig).not.toHaveBeenCalled();
  });
});
