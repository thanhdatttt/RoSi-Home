import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { paginationQuerySchema } from "../../lib/pagination.js";
import { createSurchargeSchema, updateSurchargeSchema } from "./schema.js";
import { create, list, update, remove } from "./controller.js";

export const chargesRouter = Router();

// NOTE: requireRole is applied per-route, not as a blanket router.use();
// see the comment in meters/router.ts for why a router-level role check
// is unsafe when multiple routers share the bare "/api/v1" prefix.
chargesRouter.use(requireAuth);

chargesRouter.post(
  "/properties/:propertyId/surcharges",
  requireRole("Landlord"),
  validate(createSurchargeSchema),
  asyncHandler(create),
);
chargesRouter.get(
  "/properties/:propertyId/surcharges",
  requireRole("Landlord"),
  validate(paginationQuerySchema, "query"),
  asyncHandler(list),
);
chargesRouter.patch(
  "/surcharges/:id",
  requireRole("Landlord"),
  validate(updateSurchargeSchema),
  asyncHandler(update),
);
chargesRouter.delete(
  "/surcharges/:id",
  requireRole("Landlord"),
  asyncHandler(remove),
);
