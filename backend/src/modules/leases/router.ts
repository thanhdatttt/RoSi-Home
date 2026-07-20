import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createLeaseSchema,
  endLeaseSchema,
  leaseListQuerySchema,
  leaseReminderConfigSchema,
  updateLeaseSchema,
} from "./schema.js";
import {
  create,
  end,
  get,
  getReminderConfig,
  list,
  update,
  updateReminderConfig,
  upcomingExpirations,
} from "./controller.js";

export const leasesRouter = Router();

leasesRouter.use(requireAuth);

// Landlord-only writes.
leasesRouter.post("/leases", requireRole("Landlord"), validate(createLeaseSchema), asyncHandler(create));
leasesRouter.patch("/leases/:id", requireRole("Landlord"), validate(updateLeaseSchema), asyncHandler(update));
leasesRouter.post("/leases/:id/end", requireRole("Landlord"), validate(endLeaseSchema), asyncHandler(end));

// Static path must be declared before the "/leases/:id" param route below.
leasesRouter.get("/leases/upcoming-expirations", requireRole("Landlord"), asyncHandler(upcomingExpirations));

// Read access: Landlord sees leases across their properties, Tenant sees
// only their own (scoping happens inside the service layer).
leasesRouter.get("/leases", validate(leaseListQuerySchema, "query"), asyncHandler(list));
leasesRouter.get("/leases/:id", asyncHandler(get));

leasesRouter.get(
  "/properties/:propertyId/lease-reminder-config",
  requireRole("Landlord"),
  asyncHandler(getReminderConfig),
);
leasesRouter.patch(
  "/properties/:propertyId/lease-reminder-config",
  requireRole("Landlord"),
  validate(leaseReminderConfigSchema),
  asyncHandler(updateReminderConfig),
);
