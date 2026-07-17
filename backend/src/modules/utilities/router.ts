import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { utilityRateSchema } from "./schema.js";
import { create, get } from "./controller.js";

export const utilitiesRouter = Router();

utilitiesRouter.use(requireAuth, requireRole("Landlord"));

utilitiesRouter.post(
  "/properties/:propertyId/utility-rates",
  validate(utilityRateSchema),
  asyncHandler(create),
);
utilitiesRouter.get("/properties/:propertyId/utility-rates", asyncHandler(get));
