import { apiRequest } from "@/lib/api";

export type RevenueBreakdown = { rent: number; electricity: number; water: number; surcharges: number };
export type ReportView = {
  reportId: string;
  period: { type: "month"; month: string } | { type: "custom"; startDate: string; endDate: string };
  generatedAt: string;
  timezone: string;
  landlordId: string;
  financial: {
    expectedRevenue: RevenueBreakdown;
    actualCollectedRevenue: RevenueBreakdown;
    totalOutstandingDebt: number;
    overdueInvoices: { invoiceId: string; tenant: string; room: string; dueDate: string; amount: number }[];
  };
  occupancy: {
    averageOccupancyRate: number | "N/A";
    moveIns: number;
    moveOuts: number;
    upcomingExpirations: { leaseId: string; propertyName: string; roomName: string; tenantFullName: string; endDate: string }[];
  };
  maintenance: {
    newRequests: number;
    completedRequests: number;
    resolutionRate: number | "N/A";
    averageResolutionTime: number | "N/A";
  };
};

export type GenerateReportInput =
  | { periodType: "month"; month: string }
  | { periodType: "custom"; startDate: string; endDate: string };

export function generateReport(token: string | null, input: GenerateReportInput) {
  return apiRequest<ReportView>("/reports/generate", { method: "POST", token, body: input });
}
