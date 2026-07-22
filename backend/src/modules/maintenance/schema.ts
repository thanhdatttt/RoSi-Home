import { z } from "zod";

export const submitMaintenanceRequestSchema = z
  .object({
    roomId: z.string().uuid("roomId must be a valid id."),
    title: z.string().trim().min(1, "Title is required."),
    description: z.string().trim().min(1, "Description is required."),
  })
  .strict();

export type SubmitMaintenanceRequestInput = z.infer<
  typeof submitMaintenanceRequestSchema
>;
