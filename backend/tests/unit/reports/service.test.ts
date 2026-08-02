import { describe, it, expect, vi, beforeEach } from "vitest";

vi.hoisted(() => {
  process.env.DATABASE_URL = "postgres://dummy";
});

import { generateReportService, getReportPdfService } from "../../../src/modules/reports/service.js";
import * as repo from "../../../src/modules/reports/repository.js";
import * as dashService from "../../../src/modules/dashboard/service.js";
import * as reportPdf from "../../../src/lib/reportPdf.js";
import { ForbiddenError, NotFoundError } from "../../../src/lib/errors.js";

vi.mock("../../../src/modules/reports/repository.js");
vi.mock("../../../src/modules/dashboard/service.js");
vi.mock("../../../src/lib/reportPdf.js");

describe("Reports Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("generateReportService", () => {
    it("should generate a report for a month period and save it", async () => {
      const landlordId = "landlord-1";
      const input = { periodType: "month" as const, month: "2026-07" };

      vi.mocked(repo.getRevenueSummary).mockResolvedValue({
        expectedRevenue: { rent: 100, electricity: 50, water: 20, surcharges: 10 },
        actualCollectedRevenue: { rent: 90, electricity: 50, water: 20, surcharges: 10 },
      });
      vi.mocked(dashService.getOutstandingSummaryService).mockResolvedValue({
        outstandingTotal: 10,
        overdueInvoices: [],
      });
      vi.mocked(repo.getOccupancyMetrics).mockResolvedValue({
        averageOccupancyRate: 85,
        moveIns: 2,
        moveOuts: 1,
      });
      vi.mocked(dashService.getUpcomingExpirationsService).mockResolvedValue([]);
      vi.mocked(repo.getMaintenanceMetrics).mockResolvedValue({
        newRequests: 5,
        completedRequests: 4,
        resolutionRate: 80,
        averageResolutionTime: 24,
      });
      vi.mocked(repo.saveReport).mockResolvedValue("report-123");

      const result = await generateReportService(landlordId, input);

      expect(repo.getRevenueSummary).toHaveBeenCalledWith(
        landlordId,
        "month",
        expect.any(Date),
        expect.any(Date),
        "2026-07"
      );
      expect(repo.saveReport).toHaveBeenCalledWith(
        landlordId,
        "month",
        expect.any(Date),
        expect.any(Date),
        expect.any(Object)
      );
      expect(result.reportId).toBe("report-123");
      expect(result.financial.totalOutstandingDebt).toBe(10);
      expect(result.occupancy.averageOccupancyRate).toBe(85);
      expect(result.maintenance.newRequests).toBe(5);
    });

    it("should generate a report for a custom period", async () => {
      const landlordId = "landlord-1";
      const input = { periodType: "custom" as const, startDate: "2026-07-01", endDate: "2026-07-15" };

      vi.mocked(repo.getRevenueSummary).mockResolvedValue({
        expectedRevenue: { rent: 0, electricity: 0, water: 0, surcharges: 0 },
        actualCollectedRevenue: { rent: 0, electricity: 0, water: 0, surcharges: 0 },
      });
      vi.mocked(dashService.getOutstandingSummaryService).mockResolvedValue({ outstandingTotal: 0, overdueInvoices: [] });
      vi.mocked(repo.getOccupancyMetrics).mockResolvedValue({ averageOccupancyRate: "N/A", moveIns: 0, moveOuts: 0 });
      vi.mocked(dashService.getUpcomingExpirationsService).mockResolvedValue([]);
      vi.mocked(repo.getMaintenanceMetrics).mockResolvedValue({ newRequests: 0, completedRequests: 0, resolutionRate: "N/A", averageResolutionTime: "N/A" });
      vi.mocked(repo.saveReport).mockResolvedValue("report-custom");

      const result = await generateReportService(landlordId, input);
      
      expect(result.reportId).toBe("report-custom");
      expect(result.period.type).toBe("custom");
    });
  });

  describe("getReportPdfService", () => {
    it("should generate PDF if report exists and landlord matches", async () => {
      const landlordId = "landlord-1";
      const reportId = "report-1";
      const fakePdf = new Uint8Array([1, 2, 3]);

      vi.mocked(repo.getReportById).mockResolvedValue({
        id: reportId,
        landlordId,
        periodType: "month",
        periodStart: "2026-07-01",
        periodEnd: "2026-07-31",
        snapshot: JSON.stringify({ period: { month: "2026-07" } }),
        generatedAt: new Date(),
      });
      vi.mocked(reportPdf.generateReportPdf).mockResolvedValue(fakePdf);

      const result = await getReportPdfService(landlordId, reportId);

      expect(result.pdf).toBe(fakePdf);
      expect(result.filename).toBe("Business_Report_2026-07.pdf");
      expect(reportPdf.generateReportPdf).toHaveBeenCalled();
    });

    it("should throw NotFoundError if report doesn't exist", async () => {
      vi.mocked(repo.getReportById).mockResolvedValue(undefined as any);
      await expect(getReportPdfService("L1", "R1")).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError if landlord does not own report", async () => {
      vi.mocked(repo.getReportById).mockResolvedValue({
        id: "R1",
        landlordId: "L2",
        periodType: "month",
        periodStart: "2026-07-01",
        periodEnd: "2026-07-31",
        snapshot: "{}",
        generatedAt: new Date(),
      });
      await expect(getReportPdfService("L1", "R1")).rejects.toThrow(ForbiddenError);
    });
  });
});
