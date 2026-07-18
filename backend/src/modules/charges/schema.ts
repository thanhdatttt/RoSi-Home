import { z } from "zod";

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.");

export const createSurchargeSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    monthlyAmount: z
      .number()
      .int("Amount must be a whole-number VND amount.")
      .min(0, "Amount cannot be negative."),
    effectiveFrom: dateStr,
    effectiveTo: dateStr.nullable().optional(),
  })
  .strict();

export const updateSurchargeSchema = z
  .object({
    name: z.string().min(1, "Name is required.").optional(),
    monthlyAmount: z
      .number()
      .int("Amount must be a whole-number VND amount.")
      .min(0, "Amount cannot be negative.")
      .optional(),
    effectiveFrom: dateStr.optional(),
    effectiveTo: dateStr.nullable().optional(),
  })
  .strict();

export type CreateSurchargeInput = z.infer<typeof createSurchargeSchema>;
export type UpdateSurchargeInput = z.infer<typeof updateSurchargeSchema>;
