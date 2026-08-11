import { z } from "zod";
import { BILLING_PERIOD_REGEX } from "../../lib/billingPeriod.js";

const periodStr = z
  .string()
  .regex(BILLING_PERIOD_REGEX, "billingPeriod must be YYYY-MM.");

export const meterReadingSchema = z
  .object({
    utilityType: z.enum(["Electricity", "Water"]),
    billingPeriod: periodStr,
    value: z.number().min(0, "Reading value cannot be negative."),
    isInitial: z.boolean().optional().default(false),
  })
  .strict();

export type MeterReadingInput = z.infer<typeof meterReadingSchema>;

export const correctMeterReadingSchema = z
  .object({
    value: z.number().min(0, "Reading value cannot be negative."),
  })
  .strict();

export type CorrectMeterReadingInput = z.infer<typeof correctMeterReadingSchema>;
