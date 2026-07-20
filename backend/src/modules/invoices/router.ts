import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { generateInvoicesQuerySchema } from "./schema.js";
import { get, download, send, generate } from "./controller.js";

export const invoicesRouter = Router();

// Both landlords and assigned tenants may view/download (role enforced in the
// service). Only landlords may send or trigger generation.
invoicesRouter.use(requireAuth);

// US-INVOICE-02
invoicesRouter.get("/invoices/:id", asyncHandler(get));

// US-INVOICE-03
invoicesRouter.get("/invoices/:id/pdf", asyncHandler(download));

// US-INVOICE-04
invoicesRouter.post(
  "/invoices/:id/send",
  requireRole("Landlord"),
  asyncHandler(send),
);

// US-INVOICE-01 — manual trigger for the scheduled monthly generation.
invoicesRouter.post(
  "/properties/:propertyId/invoices/generate",
  requireRole("Landlord"),
  validate(generateInvoicesQuerySchema, "query"),
  asyncHandler(generate),
);
