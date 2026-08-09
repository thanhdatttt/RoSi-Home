import { PaymentRepository } from "./repository.js";
import { NotFoundError, UnprocessableError, ForbiddenError } from "../../lib/errors.js";
import { db } from "../../db/index.js";
import { tenantInfo } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { createSignedPaymentProofUrl } from "../../lib/storage.js";
import { VIETQR_BANK_BINS, type VietQrBankCode } from "../../lib/vietqr.js";

export const PaymentService = {
  async getPaymentConfig(landlordId: string) {
    const config = await PaymentRepository.getPaymentConfig(landlordId);
    if (!config) {
      throw new NotFoundError("Payment configuration not found");
    }
    return config;
  },

  async upsertPaymentConfig(
    landlordId: string,
    data: { bankCode: string; accountNumber: string; accountHolderName: string }
  ) {
    const bankCode = data.bankCode.trim().toUpperCase() as VietQrBankCode;
    if (!VIETQR_BANK_BINS[bankCode]) {
      throw new UnprocessableError("Unsupported bank code for VietQR");
    }

    return PaymentRepository.upsertPaymentConfig(landlordId, {
      bankCode,
      accountNumber: data.accountNumber.trim().toUpperCase(),
      accountHolderName: data.accountHolderName.trim(),
    });
  },

  async getPendingProofs(landlordId: string) {
    const proofs = await PaymentRepository.getPendingProofsForLandlord(landlordId);
    return Promise.all(
      proofs.map(async (proof) => ({
        ...proof,
        fileUrl: await createSignedPaymentProofUrl(proof.fileUrl),
      })),
    );
  },

  async getPaymentHistory(user: { id: string; role: string }) {
    if (user.role === "Landlord") {
      return PaymentRepository.getPaymentHistoryForLandlord(user.id);
    } else if (user.role === "Tenant") {
      // Find tenant info
      const [info] = await db
        .select({ id: tenantInfo.id })
        .from(tenantInfo)
        .where(eq(tenantInfo.userId, user.id))
        .limit(1);

      if (!info) {
        throw new NotFoundError("Tenant info not found");
      }
      return PaymentRepository.getPaymentHistoryForTenant(info.id);
    }
    throw new ForbiddenError("Forbidden");
  },
};
