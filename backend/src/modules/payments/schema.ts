import { z } from "zod";

export const paymentConfigSchema = z.object({
  bankCode: z.string().min(1, "Bank code is required").max(50),
  accountNumber: z.string().min(1, "Account number is required").max(50),
  accountHolderName: z.string().min(1, "Account holder name is required").max(255),
});

export const paymentProofQuerySchema = z.object({
  status: z.enum(["Pending", "Verified"]).optional(),
});
