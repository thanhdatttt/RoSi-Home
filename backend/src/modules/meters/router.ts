import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  calculateMeterReadingsSchema,
  correctMeterReadingContractSchema,
  correctMeterReadingSchema,
  meterReadingListQuerySchema,
  meterReadingSchema,
} from "./schema.js";
import { calculate, correct, list, record } from "./controller.js";

export const metersRouter = Router();

// NOTE: requireRole is applied per-route, not as a blanket router.use(),
// because this router is mounted at the bare "/api/v1" prefix alongside
// other routers (e.g. invoicesRouter) that must remain reachable by
// Tenants. A blanket router-level role check would run for every request
// that reaches this router — including ones destined for a different,
// later-mounted router — and reject Tenants before their request could
// ever be dispatched there.
metersRouter.use(requireAuth);

metersRouter.get(
  "/rooms/:roomId/meter-readings",
  requireRole("Landlord"),
  validate(meterReadingListQuerySchema, "query"),
  asyncHandler(list),
);

// US-METER-01 / US-METER-02
metersRouter.post(
  "/rooms/:roomId/meter-readings",
  requireRole("Landlord"),
  validate(meterReadingSchema),
  asyncHandler(record),
);

// US-METER-02 — record all required monthly readings and calculate the
// reproducible electricity/water breakdown in one transaction.
metersRouter.post(
  "/rooms/:roomId/meter-readings/calculate",
  requireRole("Landlord"),
  validate(calculateMeterReadingsSchema),
  asyncHandler(calculate),
);

// US-METER-03
metersRouter.patch(
  "/meter-readings/:id/correct",
  requireRole("Landlord"),
  validate(correctMeterReadingContractSchema),
  asyncHandler(correct),
);

// Backward-compatible alias retained for existing clients.
metersRouter.post(
  "/meter-readings/:id/correct",
  requireRole("Landlord"),
  validate(correctMeterReadingSchema),
  asyncHandler(correct),
);
