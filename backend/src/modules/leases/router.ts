import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createLeaseSchema,
  endLeaseSchema,
  leaseListQuerySchema,
  updateLeaseSchema,
} from "./schema.js";
import {
  create,
  end,
  get,
  list,
  update,
  upcomingExpirations,
} from "./controller.js";

export const leasesRouter = Router();

leasesRouter.use(requireAuth);

// Landlord-only writes.
leasesRouter.post("/", requireRole("Landlord"), validate(createLeaseSchema), asyncHandler(create));
leasesRouter.patch("/:id", requireRole("Landlord"), validate(updateLeaseSchema), asyncHandler(update));
leasesRouter.post("/:id/end", requireRole("Landlord"), validate(endLeaseSchema), asyncHandler(end));

// Static path must be declared before the "/:id" param route below.
leasesRouter.get("/upcoming-expirations", requireRole("Landlord"), asyncHandler(upcomingExpirations));

// Read access: Landlord sees leases across their properties, Tenant sees
// only their own (scoping happens inside the service layer).
leasesRouter.get("/", validate(leaseListQuerySchema, "query"), asyncHandler(list));
leasesRouter.get("/:id", asyncHandler(get));
