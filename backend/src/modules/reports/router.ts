import { Router } from "express";
import { generateReport, downloadReportPdf } from "./controller.js";
import { requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { generateReportSchema } from "./schema.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const reportsRouter = Router();

reportsRouter.post(
  "/generate",
  requireRole("Landlord"),
  validate(generateReportSchema),
  asyncHandler(generateReport)
);

reportsRouter.get(
  "/:id/pdf",
  requireRole("Landlord"),
  asyncHandler(downloadReportPdf)
);

export { reportsRouter };
