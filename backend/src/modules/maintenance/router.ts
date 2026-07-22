import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { submit } from "./controller.js";
import { submitMaintenanceRequestSchema } from "./schema.js";
import { uploadMaintenancePhotos } from "./upload.js";

export const maintenanceRouter = Router();

maintenanceRouter.post(
  "/",
  requireAuth,
  requireRole("Tenant"),
  uploadMaintenancePhotos,
  validate(submitMaintenanceRequestSchema),
  asyncHandler(submit),
);
