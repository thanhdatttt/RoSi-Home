import { z } from "zod";
import { utilityRateSchema } from "../utilities/schema.js";

export const createPropertySchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    address: z.string().min(1, "Address is required."),
    locality: z.string().trim().min(1).optional(),
    utilityRates: utilityRateSchema.omit({ effectiveFrom: true }),
  })
  .strict();

export const updatePropertySchema = z
  .object({
    name: z.string().min(1, "Name is required.").optional(),
    address: z.string().min(1, "Address is required.").optional(),
    locality: z.string().trim().min(1).optional(),
  })
  .strict();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
