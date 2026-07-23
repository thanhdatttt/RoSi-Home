import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { paginationQuerySchema } from "../../lib/pagination.js";
import { updateTenantSchema } from "./schema.js";
import { list, get, update, archive } from "./controller.js";

export const tenantsRouter = Router();

tenantsRouter.use(requireAuth, requireRole("Landlord"));

tenantsRouter.get("/", validate(paginationQuerySchema, "query"), asyncHandler(list));
tenantsRouter.get("/:id", asyncHandler(get));
tenantsRouter.patch("/:id", validate(updateTenantSchema), asyncHandler(update));
tenantsRouter.delete("/:id", asyncHandler(archive));
