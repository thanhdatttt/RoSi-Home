import { z } from "zod";
import { businessDate } from "../../lib/businessDate.js";

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

const monthOnlyStr = dateStr.refine((val) => val.endsWith("-01"), {
  message: "Date must be the 1st of the month (YYYY-MM-01).",
});

const futureDateStr = monthOnlyStr.refine((value) => value > businessDate(), {
  message: "effectiveFrom must be strictly in the future (greater than today).",
});

export const createSurchargeSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    monthlyAmount: z
      .number()
      .int("Amount must be a whole-number VND amount.")
      .min(0, "Amount cannot be negative."),
    effectiveFrom: futureDateStr,
    effectiveTo: monthOnlyStr.nullable().optional(),
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
    effectiveFrom: monthOnlyStr.optional(),
    effectiveTo: monthOnlyStr.nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export type CreateSurchargeInput = z.infer<typeof createSurchargeSchema>;
export type UpdateSurchargeInput = z.infer<typeof updateSurchargeSchema>;
