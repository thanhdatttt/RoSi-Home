import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { paginationQuerySchema } from "../../lib/pagination.js";
import {
  createPropertySchema,
  updatePropertySchema,
} from "./schema.js";
import { create, list, get, update } from "./controller.js";

export const propertiesRouter = Router();

propertiesRouter.use(requireAuth, requireRole("Landlord"));

propertiesRouter.post("/", validate(createPropertySchema), asyncHandler(create));
propertiesRouter.get("/", validate(paginationQuerySchema, "query"), asyncHandler(list));
propertiesRouter.get("/:id", asyncHandler(get));
propertiesRouter.patch("/:id", validate(updatePropertySchema), asyncHandler(update));
