import { ForbiddenError, NotFoundError } from "../../lib/errors.js";
import { getOutstandingSummaryService, getUpcomingExpirationsService } from "../dashboard/service.js";
import type { GenerateReportInput } from "./schema.js";
import {
  getMaintenanceMetrics,
  getOccupancyMetrics,
  getReportById,
  getRevenueSummary,
  saveReport,
} from "./repository.js";
import { generateReportPdf } from "../../lib/reportPdf.js";

export async function generateReportService(landlordId: string, input: GenerateReportInput) {
  let periodStart: Date;
  let periodEnd: Date;
  let periodObj: any;
  
  if (input.periodType === "month") {
    // month is YYYY-MM
    const [year, month] = input.month!.split("-");
    periodStart = new Date(Number(year), Number(month) - 1, 1);
    periodEnd = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    periodObj = { type: "month", month: input.month };
  } else {
    periodStart = new Date(input.startDate!);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(input.endDate!);
    periodEnd.setHours(23, 59, 59, 999);
    periodObj = { type: "custom", startDate: input.startDate, endDate: input.endDate };
  }

  const [
    financial,
    outstandingSummary,
    occupancy,
    upcomingExpirations,
    maintenance
  ] = await Promise.all([
    getRevenueSummary(landlordId, input.periodType, periodStart, periodEnd, input.month),
    getOutstandingSummaryService(landlordId),
    getOccupancyMetrics(landlordId, periodStart, periodEnd),
    getUpcomingExpirationsService(landlordId),
    getMaintenanceMetrics(landlordId, periodStart, periodEnd)
  ]);

  const reportData = {
    period: periodObj,
    generatedAt: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    landlordId,
    financial: {
      expectedRevenue: financial.expectedRevenue,
      actualCollectedRevenue: financial.actualCollectedRevenue,
      totalOutstandingDebt: outstandingSummary.outstandingTotal,
      overdueInvoices: outstandingSummary.overdueInvoices,
    },
    occupancy: {
      ...occupancy,
      upcomingExpirations,
    },
    maintenance
  };

  const reportId = await saveReport(landlordId, input.periodType, periodStart, periodEnd, reportData);

  return { reportId, ...reportData };
}

export async function getReportPdfService(landlordId: string, reportId: string) {
  const report = await getReportById(reportId, landlordId);
  if (!report) {
    throw new NotFoundError("Report not found");
  }
  
  if (report.landlordId !== landlordId) {
    throw new ForbiddenError("Not authorized to view this report");
  }

  const snapshot = JSON.parse(report.snapshot);
  
  // ensure reportId is in snapshot for the PDF header
  snapshot.reportId = report.id;

  const pdf = await generateReportPdf(snapshot);
  
  const filename = report.periodType === "month" 
    ? `Business_Report_${snapshot.period.month}.pdf` 
    : `Business_Report_${snapshot.period.startDate}_to_${snapshot.period.endDate}.pdf`;

  return { pdf, filename };
}
