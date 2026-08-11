import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { meterReadingSchema, correctMeterReadingSchema } from "./schema.js";
import { record, correct } from "./controller.js";

export const metersRouter = Router();

// NOTE: requireRole is applied per-route, not as a blanket router.use(),
// because this router is mounted at the bare "/api/v1" prefix alongside
// other routers (e.g. invoicesRouter) that must remain reachable by
// Tenants. A blanket router-level role check would run for every request
// that reaches this router — including ones destined for a different,
// later-mounted router — and reject Tenants before their request could
// ever be dispatched there.
metersRouter.use(requireAuth);

// US-METER-01 / US-METER-02
metersRouter.post(
  "/rooms/:roomId/meter-readings",
  requireRole("Landlord"),
  validate(meterReadingSchema),
  asyncHandler(record),
);

// US-METER-03
metersRouter.post(
  "/meter-readings/:id/correct",
  requireRole("Landlord"),
  validate(correctMeterReadingSchema),
  asyncHandler(correct),
);
