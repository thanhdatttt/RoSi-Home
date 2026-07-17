import { z } from "zod";

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
    effectiveFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "effectiveFrom must be YYYY-MM-DD."),
  })
  .strict()
  .superRefine((val, ctx) => {
    if (val.waterBillingMethod === "Metered") {
      if (val.waterRatePerM3 === undefined || val.waterRatePerM3 === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["waterRatePerM3"],
          message: "waterRatePerM3 is required when method is Metered.",
        });
      }
      if (val.waterFlatAmountPerTenant !== undefined && val.waterFlatAmountPerTenant !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["waterFlatAmountPerTenant"],
          message: "waterFlatAmountPerTenant must be omitted for Metered.",
        });
      }
    } else {
      if (val.waterFlatAmountPerTenant === undefined || val.waterFlatAmountPerTenant === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["waterFlatAmountPerTenant"],
          message: "waterFlatAmountPerTenant is required when method is Flat.",
        });
      }
      if (val.waterRatePerM3 !== undefined && val.waterRatePerM3 !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["waterRatePerM3"],
          message: "waterRatePerM3 must be omitted for Flat.",
        });
      }
    }
  });

export type UtilityRateInput = z.infer<typeof utilityRateSchema>;
