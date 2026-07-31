import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { generateInvoicesQuerySchema } from "./schema.js";
import { get, download, send, generate, getVietqr, uploadProof, confirmPayment, remind } from "./controller.js";
import multer from "multer";

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

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

// US-VIETQR-02
invoicesRouter.get("/invoices/:id/vietqr", asyncHandler(getVietqr));

// US-PAYMENT-01
invoicesRouter.post(
  "/invoices/:id/payment-proofs",
  requireRole("Tenant"),
  upload.single("proof"),
  asyncHandler(uploadProof),
);

// US-PAYMENT-02
invoicesRouter.post(
  "/invoices/:id/confirm-payment",
  requireRole("Landlord"),
  asyncHandler(confirmPayment),
);

// US-REMINDER-02
invoicesRouter.post(
  "/invoices/:id/remind",
  requireRole("Landlord"),
  asyncHandler(remind),
);
