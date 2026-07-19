import { z } from "zod";

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.")
  .refine(
    (value) => {
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === value
      );
    },
    { message: "Date must be a valid calendar date." },
  );

export const createSurchargeSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
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
    name: z.string().trim().min(1, "Name is required.").optional(),
    monthlyAmount: z
      .number()
      .int("Amount must be a whole-number VND amount.")
      .min(0, "Amount cannot be negative.")
      .optional(),
    effectiveFrom: dateStr.optional(),
    effectiveTo: dateStr.nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export type CreateSurchargeInput = z.infer<typeof createSurchargeSchema>;
export type UpdateSurchargeInput = z.infer<typeof updateSurchargeSchema>;
