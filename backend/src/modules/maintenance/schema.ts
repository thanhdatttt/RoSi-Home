import { z } from "zod";

export const maintenanceStatusSchema = z.enum([
  "Pending",
  "InProgress",
  "Completed",
]);

export type MaintenanceStatus = z.infer<typeof maintenanceStatusSchema>;

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

export const roomMaintenanceHistoryParamsSchema = z
  .object({
    roomId: z.string().uuid("roomId must be a valid room id."),
  })
  .strict();

export const maintenanceRequestListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    propertyId: z.string().uuid("propertyId must be a valid id.").optional(),
    status: maintenanceStatusSchema.optional(),
  })
  .strict();

export type MaintenanceRequestListQuery = z.infer<
  typeof maintenanceRequestListQuerySchema
>;

export const updateMaintenanceStatusSchema = z
  .object({
    status: maintenanceStatusSchema,
  })
  .strict();

export type UpdateMaintenanceStatusInput = z.infer<
  typeof updateMaintenanceStatusSchema
>;
