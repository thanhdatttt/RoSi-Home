import type { Request, Response } from "express";
import { previousMonthPeriod } from "../../lib/billingPeriod.js";
import { generateInvoicePdf } from "../../lib/invoicePdf.js";
import type { InvoiceView } from "./service.js";
import {
  getInvoiceService,
  sendInvoiceService,
  generateInvoicesForProperty,
} from "./service.js";
import type { GenerateInvoicesQuery } from "./schema.js";

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

export { get, download, send, generate };
