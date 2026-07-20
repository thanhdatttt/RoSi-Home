import { z } from "zod";

export const updateTenantSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required.").optional(),
    phone: z
      .string()
      .min(1, "Phone is required.")
      .regex(/^[0-9+()\-\s]+$/, "Phone contains invalid characters.")
      .optional(),
    email: z.string().email("Invalid email.").optional(),
    idNumber: z.string().min(1, "ID number is required.").optional(),
  })
  .strict();

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
