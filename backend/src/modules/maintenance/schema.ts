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

export const maintenanceRequestParamsSchema = z
  .object({
    id: z.string().uuid("id must be a valid maintenance request id."),
  })
  .strict();

export const maintenanceRequestListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    propertyId: z.string().uuid("propertyId must be a valid id.").optional(),
    status: z.enum(["Pending", "InProgress", "Completed"]).optional(),
  })
  .strict();

export type MaintenanceRequestListQuery = z.infer<
  typeof maintenanceRequestListQuerySchema
>;
