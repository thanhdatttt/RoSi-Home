import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { get, list, submit } from "./controller.js";
import {
  maintenanceRequestListQuerySchema,
  maintenanceRequestParamsSchema,
  submitMaintenanceRequestSchema,
} from "./schema.js";
import { uploadMaintenancePhotos } from "./upload.js";

export const maintenanceRouter = Router();

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

maintenanceRouter.post(
  "/",
  requireRole("Tenant"),
  uploadMaintenancePhotos,
  validate(submitMaintenanceRequestSchema),
  asyncHandler(submit),
);
