import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { paginationQuerySchema } from "../../lib/pagination.js";
import { createSurchargeSchema, updateSurchargeSchema } from "./schema.js";
import { create, list, update, remove } from "./controller.js";

export const chargesRouter = Router();

chargesRouter.use(requireAuth, requireRole("Landlord"));

chargesRouter.post(
  "/properties/:propertyId/surcharges",
  validate(createSurchargeSchema),
  asyncHandler(create),
);
chargesRouter.get(
  "/properties/:propertyId/surcharges",
  validate(paginationQuerySchema, "query"),
  asyncHandler(list),
);
chargesRouter.patch("/surcharges/:id", validate(updateSurchargeSchema), asyncHandler(update));
chargesRouter.delete("/surcharges/:id", asyncHandler(remove));
