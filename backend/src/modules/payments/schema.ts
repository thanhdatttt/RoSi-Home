import { z } from "zod";

export const paymentConfigSchema = z.object({
<<<<<<< HEAD
  bankCode: z.string().trim().min(1, "Bank code is required").max(10),
  accountNumber: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{5,19}$/, "Account number must contain 5-19 letters or digits"),
  accountHolderName: z.string().trim().min(2, "Account holder name is required").max(255),
}).strict();
=======
  bankCode: z.string().min(1, "Bank code is required").max(50),
  accountNumber: z.string().min(1, "Account number is required").max(50),
  accountHolderName: z.string().min(1, "Account holder name is required").max(255),
});
>>>>>>> origin/main

export const paymentProofQuerySchema = z.object({
  status: z.enum(["Pending", "Verified"]).optional(),
});
