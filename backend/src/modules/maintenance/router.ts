import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { paginationQuerySchema } from "../../lib/pagination.js";
import { get, list, listRoomHistory, submit, updateStatus } from "./controller.js";
import {
  maintenanceRequestListQuerySchema,
  maintenanceRequestParamsSchema,
  roomMaintenanceHistoryParamsSchema,
  submitMaintenanceRequestSchema,
  updateMaintenanceStatusSchema,
} from "./schema.js";
import { uploadMaintenancePhotos } from "./upload.js";

export const maintenanceRouter = Router();
export const roomMaintenanceRouter = Router();

maintenanceRouter.use(requireAuth);

maintenanceRouter.get(
  "/",
  validate(maintenanceRequestListQuerySchema, "query"),
  asyncHandler(list),
);

maintenanceRouter.get(
  "/:id",
  validate(maintenanceRequestParamsSchema, "params"),
  asyncHandler(get),
);

maintenanceRouter.patch(
  "/:id/status",
  requireRole("Landlord"),
  validate(maintenanceRequestParamsSchema, "params"),
  validate(updateMaintenanceStatusSchema),
  asyncHandler(updateStatus),
);

maintenanceRouter.post(
  "/",
  requireRole("Tenant"),
  uploadMaintenancePhotos,
  validate(submitMaintenanceRequestSchema),
  asyncHandler(submit),
);

roomMaintenanceRouter.get(
  "/:roomId/maintenance-requests",
  requireAuth,
  requireRole("Landlord"),
  validate(roomMaintenanceHistoryParamsSchema, "params"),
  validate(paginationQuerySchema, "query"),
  asyncHandler(listRoomHistory),
);
