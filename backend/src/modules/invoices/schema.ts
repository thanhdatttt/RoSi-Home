import { z } from "zod";
import { BILLING_PERIOD_REGEX } from "../../lib/billingPeriod.js";

const periodStr = z
  .string()
  .regex(BILLING_PERIOD_REGEX, "period must be YYYY-MM.");

// Manual trigger for the scheduled monthly generation (US-INVOICE-01).
export const generateInvoicesQuerySchema = z
  .object({
    period: periodStr.optional(),
  })
  .strict();

export type GenerateInvoicesQuery = z.infer<typeof generateInvoicesQuerySchema>;
