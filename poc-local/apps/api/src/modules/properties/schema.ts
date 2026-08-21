import { z } from "zod";

export const createPropertyInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(200),
});

export const utilityRateInputSchema = z.object({
  electricityRate: z.number().int().min(0).max(1_000_000_000),
  waterRate: z.number().int().min(0).max(1_000_000_000),
});

export type CreatePropertyInput = z.infer<typeof createPropertyInputSchema>;
export type UtilityRateInput = z.infer<typeof utilityRateInputSchema>;
