import { Request, Response } from "express";
import { PaymentService } from "./service.js";
import { AppError } from "../../lib/errors.js";

export async function getPaymentConfig(req: Request, res: Response) {
  if (req.user!.role !== "Landlord") {
    throw new AppError(403, "Only landlords can view payment configs");
  }
  const config = await PaymentService.getPaymentConfig(req.user!.id);
  res.json({ data: config });
}

export async function updatePaymentConfig(req: Request, res: Response) {
  if (req.user!.role !== "Landlord") {
    throw new AppError(403, "Only landlords can update payment configs");
  }
  const { bankCode, accountNumber, accountHolderName } = req.body;
  const config = await PaymentService.upsertPaymentConfig(req.user!.id, {
    bankCode,
    accountNumber,
    accountHolderName,
  });
  res.json({ data: config });
}

export async function getPendingProofs(req: Request, res: Response) {
  if (req.user!.role !== "Landlord") {
    throw new AppError(403, "Only landlords can view pending payment proofs");
  }
  // status is validated by schema, implicitly Pending for landlord queue
  const proofs = await PaymentService.getPendingProofs(req.user!.id);
  res.json({ data: proofs });
}

export async function getPaymentHistory(req: Request, res: Response) {
  const history = await PaymentService.getPaymentHistory(req.user!);
  res.json({ data: history });
}
