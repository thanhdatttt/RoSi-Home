import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { paymentConfigSchema, paymentProofQuerySchema } from "./schema.js";
import {
  getPaymentConfig,
  updatePaymentConfig,
  getPendingProofs,
  getPaymentHistory,
} from "./controller.js";

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);

// US-VIETQR-01
paymentsRouter.get("/payment-config", requireRole("Landlord"), asyncHandler(getPaymentConfig));
paymentsRouter.put(
  "/payment-config",
  requireRole("Landlord"),
  validate(paymentConfigSchema),
  asyncHandler(updatePaymentConfig)
);

// US-PAYMENT-02 (list pending proofs)
paymentsRouter.get(
  "/payment-proofs",
  requireRole("Landlord"),
  validate(paymentProofQuerySchema, "query"),
  asyncHandler(getPendingProofs)
);

// US-PAYMENT-03
paymentsRouter.get("/payments/history", asyncHandler(getPaymentHistory));
