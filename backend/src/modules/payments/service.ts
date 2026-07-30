import { PaymentRepository } from "./repository.js";
import { AppError } from "../../lib/errors.js";
import { db } from "../../db/index.js";
import { tenantInfo } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export const PaymentService = {
  async getPaymentConfig(landlordId: string) {
    const config = await PaymentRepository.getPaymentConfig(landlordId);
    if (!config) {
      throw new AppError(404, "Payment configuration not found");
    }
    return config;
  },

  async upsertPaymentConfig(
    landlordId: string,
    data: { bankCode: string; accountNumber: string; accountHolderName: string }
  ) {
    // Validate bank code - hardcode popular VietQR supported banks for now.
    // E.g. VCB, TCB, MB, VPB, ACB, STB, BIDV, CTG, etc.
    const supportedBanks = ["VCB", "TCB", "MB", "VPB", "ACB", "STB", "BIDV", "CTG", "VIB", "TPB", "HDB"];
    if (!supportedBanks.includes(data.bankCode.toUpperCase())) {
      throw new AppError(422, "Unsupported bank code for VietQR");
    }

    return PaymentRepository.upsertPaymentConfig(landlordId, data);
  },

  async getPendingProofs(landlordId: string) {
    return PaymentRepository.getPendingProofsForLandlord(landlordId);
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
        throw new AppError(404, "Tenant info not found");
      }
      return PaymentRepository.getPaymentHistoryForTenant(info.id);
    }
    throw new AppError(403, "Forbidden");
  },
};
