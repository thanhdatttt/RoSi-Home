import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { meterReadingSchema, correctMeterReadingSchema } from "./schema.js";
import { record, correct } from "./controller.js";

export const metersRouter = Router();

metersRouter.use(requireAuth, requireRole("Landlord"));

// US-METER-01 / US-METER-02
metersRouter.post(
  "/rooms/:roomId/meter-readings",
  validate(meterReadingSchema),
  asyncHandler(record),
);

// US-METER-03
metersRouter.post(
  "/meter-readings/:id/correct",
  validate(correctMeterReadingSchema),
  asyncHandler(correct),
);
