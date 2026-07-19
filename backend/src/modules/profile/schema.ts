import { z } from "zod";

export const updateProfileSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required.").optional(),
    phone: z.string().min(1, "Phone is required.").optional(),
  })
  .strict();
