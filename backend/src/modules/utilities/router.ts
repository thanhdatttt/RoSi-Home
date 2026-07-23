import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { utilityRateSchema } from "./schema.js";
import { create, get } from "./controller.js";

export const utilitiesRouter = Router();

// NOTE: requireRole is applied per-route, not as a blanket router.use();
// see the comment in meters/router.ts for why a router-level role check
// is unsafe when multiple routers share the bare "/api/v1" prefix.
utilitiesRouter.use(requireAuth);

utilitiesRouter.post(
  "/properties/:propertyId/utility-rates",
  requireRole("Landlord"),
  validate(utilityRateSchema),
  asyncHandler(create),
);
utilitiesRouter.get(
  "/properties/:propertyId/utility-rates",
  requireRole("Landlord"),
  asyncHandler(get),
);
