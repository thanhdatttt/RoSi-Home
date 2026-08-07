import type { Request, Response } from "express";
import {
  getInvoiceService,
  sendInvoiceService,
  generateInvoicesForProperty,
  listInvoicesService,
  listInvoicesForTenantService,
} from "./service.js";
import { generateInvoicePdf } from "../../lib/invoicePdf.js";
import { previousMonthPeriod } from "../../lib/billingPeriod.js";
import type { GenerateInvoicesQuery } from "./schema.js";
import { UnprocessableError } from "../../lib/errors.js";
import {
  getVietqrService,
  uploadPaymentProofService,
  confirmPaymentService,
  sendManualReminderService,
} from "./paymentService.js";

async function get(req: Request, res: Response): Promise<void> {
  const view = await getInvoiceService(
    req.user!.id,
    req.user!.role,
    req.params.id,
  );
  res.status(200).json({ data: view });
}

async function list(req: Request, res: Response): Promise<void> {
  const items = await listInvoicesService(req.user!.id);
  res.status(200).json({ data: items });
}

async function listForTenant(req: Request, res: Response): Promise<void> {
  const items = await listInvoicesForTenantService(req.user!.id);
  res.status(200).json({ data: items });
}

async function download(req: Request, res: Response): Promise<void> {
  const view = await getInvoiceService(
    req.user!.id,
    req.user!.role,
    req.params.id,
  );
  const pdf = await generateInvoicePdf(view);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="invoice-${view.billingPeriod}-${view.id}.pdf"`,
  );
  res.send(Buffer.from(pdf));
}

async function send(req: Request, res: Response): Promise<void> {
  const view = await sendInvoiceService(req.user!.id, req.params.id);
  res.status(200).json({ data: view });
}

async function generate(req: Request, res: Response): Promise<void> {
  const { period } = req.query as unknown as GenerateInvoicesQuery;
  const target = period ?? previousMonthPeriod();
  const result = await generateInvoicesForProperty(
    req.user!.id,
    req.params.propertyId,
    target,
  );
  res.status(200).json({ data: result });
}

async function getVietqr(req: Request, res: Response): Promise<void> {
  const result = await getVietqrService(req.user!.id, req.user!.role, req.params.id);
  res.status(200).json({ data: result });
}

async function uploadProof(req: Request, res: Response): Promise<void> {
  if (req.user!.role !== "Tenant") {
    throw new UnprocessableError("Only tenants can upload payment proofs");
  }
  if (!req.file) {
    throw new UnprocessableError("Payment proof file is required");
  }
  const contentType = req.file.mimetype as "image/png" | "image/jpeg";
  if (contentType !== "image/png" && contentType !== "image/jpeg") {
    throw new UnprocessableError("Unsupported file type");
  }
  
  const result = await uploadPaymentProofService(
    req.user!.id,
    req.params.id,
    req.file.buffer,
    contentType
  );
  res.status(201).json({ data: result });
}

async function confirmPayment(req: Request, res: Response): Promise<void> {
  if (req.user!.role !== "Landlord") {
    throw new UnprocessableError("Only landlords can confirm payments");
  }
  const result = await confirmPaymentService(req.user!.id, req.params.id);
  res.status(200).json({ data: result });
}

async function remind(req: Request, res: Response): Promise<void> {
  if (req.user!.role !== "Landlord") {
    throw new UnprocessableError("Only landlords can send manual reminders");
  }
  const result = await sendManualReminderService(req.user!.id, req.params.id);
  res.status(200).json({ data: result });
}

export { get, download, send, generate,  getVietqr,
  uploadProof,
  confirmPayment,
  remind,
  list,
  listForTenant,
};
