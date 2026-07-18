import { z } from "zod";

export const createPropertySchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    address: z.string().min(1, "Address is required."),
  })
  .strict();

export const updatePropertySchema = z
  .object({
    name: z.string().min(1, "Name is required.").optional(),
    address: z.string().min(1, "Address is required.").optional(),
  })
  .strict();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
