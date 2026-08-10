import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import jwt from "jsonwebtoken";
import * as service from "../../src/modules/reports/service.js";

vi.mock("../../src/modules/reports/service.js");

describe("Reports API Contract", () => {
  let token: string;

  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env.JWT_SECRET = "test-secret";
    app = createApp();
    token = jwt.sign({ sub: "landlord-1", role: "Landlord" }, "test-secret");
  });

  describe("POST /api/v1/reports/generate", () => {
    it("should generate a report (200 OK)", async () => {
      vi.mocked(service.generateReportService).mockResolvedValue({
        reportId: "rep-1",
        period: { type: "month", month: "2026-07" },
        generatedAt: new Date().toISOString(),
        timezone: "UTC",
        landlordId: "landlord-1",
        financial: {
          expectedRevenue: { rent: 1, electricity: 0, water: 0, surcharges: 0 },
          actualCollectedRevenue: { rent: 1, electricity: 0, water: 0, surcharges: 0 },
          totalOutstandingDebt: 0,
          overdueInvoices: [],
        },
        occupancy: { averageOccupancyRate: 100, moveIns: 0, moveOuts: 0, upcomingExpirations: [] },
        maintenance: { newRequests: 0, completedRequests: 0, resolutionRate: "N/A", averageResolutionTime: "N/A" }
      });

      const res = await request(app)
        .post("/api/v1/reports/generate")
        .set("Authorization", `Bearer ${token}`)
        .send({ periodType: "month", month: "2026-07" });

      expect(res.status).toBe(200);
      expect(res.body.data.reportId).toBe("rep-1");
      expect(service.generateReportService).toHaveBeenCalledWith("landlord-1", { periodType: "month", month: "2026-07" });
    });

    it("should return 400 if month is missing for periodType month", async () => {
      const res = await request(app)
        .post("/api/v1/reports/generate")
        .set("Authorization", `Bearer ${token}`)
        .send({ periodType: "month" });

      expect(res.status).toBe(400);
    });

    it("should return 400 if startDate is after endDate", async () => {
      const res = await request(app)
        .post("/api/v1/reports/generate")
        .set("Authorization", `Bearer ${token}`)
        .send({ periodType: "custom", startDate: "2026-08-01", endDate: "2026-07-01" });

      expect(res.status).toBe(400);
    });

    it("should return 403 for Tenant role", async () => {
      const tenantToken = jwt.sign({ sub: "tenant-1", role: "Tenant" }, "test-secret");
      const res = await request(app)
        .post("/api/v1/reports/generate")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({ periodType: "month", month: "2026-07" });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/reports/:id/pdf", () => {
    it("should return a PDF file (200 OK)", async () => {
      const fakePdf = Buffer.from("fake-pdf-content");
      vi.mocked(service.getReportPdfService).mockResolvedValue({
        pdf: fakePdf,
        filename: "Business_Report_2026-07.pdf"
      });

      const res = await request(app)
        .get("/api/v1/reports/rep-1/pdf")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toBe("application/pdf");
      expect(res.headers["content-disposition"]).toContain('attachment; filename="Business_Report_2026-07.pdf"');
      expect(res.body).toEqual(fakePdf);
    });
  });
});
