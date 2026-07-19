import { z } from "zod";

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "effectiveFrom must be YYYY-MM-DD.")
  .refine(
    (value) => {
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === value
      );
    },
    { message: "effectiveFrom must be a valid calendar date." },
  );

export const utilityRateSchema = z
  .object({
    electricityRatePerKwh: z
      .number()
      .int("Rate must be a whole-number VND amount.")
      .min(0, "Rate cannot be negative."),
    waterBillingMethod: z.enum(["Metered", "Flat"]),
    waterRatePerM3: z
      .number()
      .int("Rate must be a whole-number VND amount.")
      .min(0, "Rate cannot be negative.")
      .nullable()
      .optional(),
    waterFlatAmountPerTenant: z
      .number()
      .int("Amount must be a whole-number VND amount.")
      .min(0, "Amount cannot be negative.")
      .nullable()
      .optional(),
    effectiveFrom: dateStr,
  })
  .strict();

export type UtilityRateInput = z.infer<typeof utilityRateSchema>;
