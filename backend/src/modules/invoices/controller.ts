import type { Request, Response } from "express";
import {
  getInvoiceService,
  sendInvoiceService,
  generateInvoicesForProperty,
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
  if (req.file.buffer.length === 0) {
    throw new UnprocessableError("Payment proof file cannot be empty");
  }
  const contentType = req.file.mimetype as "image/png" | "image/jpeg";
  if (contentType !== "image/png" && contentType !== "image/jpeg") {
    throw new UnprocessableError("Unsupported file type");
  }
  const isPng =
    req.file.buffer.length >= 8 &&
    req.file.buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  const isJpeg =
    req.file.buffer.length >= 3 &&
    req.file.buffer[0] === 0xff &&
    req.file.buffer[1] === 0xd8 &&
    req.file.buffer[2] === 0xff;
  if (
    (contentType === "image/png" && !isPng) ||
    (contentType === "image/jpeg" && !isJpeg)
  ) {
    throw new UnprocessableError("File content does not match its image type");
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

export { get, download, send, generate, getVietqr, uploadProof, confirmPayment, remind };
