import type { Request, Response } from "express";
import { generateReportService, getReportPdfService } from "./service.js";
import type { GenerateReportInput } from "./schema.js";

export async function generateReport(req: Request, res: Response) {
  const input = req.body as GenerateReportInput;
  const report = await generateReportService(req.user!.id, input);
  res.json({ data: report });
}

export async function downloadReportPdf(req: Request, res: Response) {
  const { id } = req.params;
  const { pdf, filename } = await getReportPdfService(req.user!.id, id);
  
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(Buffer.from(pdf));
}
