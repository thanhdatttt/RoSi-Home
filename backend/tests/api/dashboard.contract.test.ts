import type { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const TEST_JWT_SECRET = "dashboard-contract-test-secret";
const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_LANDLORD_ID = "99999999-9999-4999-9999-999999999999";
const TENANT_ID = "44444444-4444-4444-8444-444444444444";
const INVOICE_ID = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const LEASE_ID = "66666666-6666-4666-8666-666666666666";

const mocks = vi.hoisted(() => ({
  getOutstandingSummaryService: vi.fn(),
  getUpcomingExpirationsService: vi.fn(),
}));

vi.mock("../../src/modules/dashboard/service.js", () => ({
  getOutstandingSummaryService: mocks.getOutstandingSummaryService,
  getUpcomingExpirationsService: mocks.getUpcomingExpirationsService,
}));

function token(sub: string, role: "Landlord" | "Tenant"): string {
  return jwt.sign({ sub, role, mustChangePassword: false }, TEST_JWT_SECRET, {
    expiresIn: "1h",
  });
}

const outstandingSummary = {
  outstandingTotal: 7000000,
  overdueInvoices: [
    {
      invoiceId: INVOICE_ID,
      tenant: "Tran Thi B",
      room: "Room A",
      dueDate: "2026-06-30",
      amount: 3500000,
    },
  ],
};

const upcomingExpirations = [
  {
    leaseId: LEASE_ID,
    propertyId: "55555555-5555-4555-8555-555555555555",
    propertyName: "Property A",
    roomId: "22222222-2222-4222-8222-222222222222",
    roomName: "Room A",
    tenantFullName: "Tran Thi B",
    endDate: "2026-08-15",
  },
];

describe("Dashboard HTTP contract", () => {
  let app: Express;
  let landlordToken: string;
  let tenantToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.DATABASE_URL = "postgres://test:test@127.0.0.1:1/contract_tests";
    const module = await import("../../src/app.js");
    app = module.createApp();
    landlordToken = token(LANDLORD_ID, "Landlord");
    tenantToken = token(TENANT_ID, "Tenant");
  });

  beforeEach(() => {
    mocks.getOutstandingSummaryService.mockResolvedValue(outstandingSummary);
    mocks.getUpcomingExpirationsService.mockResolvedValue(upcomingExpirations);
  });

  // --- US-DASH-03: GET /api/v1/dashboard/outstanding ----------------------

  describe("US-DASH-03 — outstanding and overdue invoices", () => {
    it("rejects an unauthenticated request", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/outstanding")
        .expect(401);

      expect(response.body.error).toMatchObject({ code: "UNAUTHENTICATED" });
      expect(mocks.getOutstandingSummaryService).not.toHaveBeenCalled();
    });

    it("rejects a Tenant from accessing the dashboard", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/outstanding")
        .set("Authorization", `Bearer ${tenantToken}`)
        .expect(403);

      expect(response.body.error).toMatchObject({ code: "FORBIDDEN" });
      expect(mocks.getOutstandingSummaryService).not.toHaveBeenCalled();
    });

    it("returns outstanding total and overdue invoices for the landlord", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/outstanding")
        .set("Authorization", `Bearer ${landlordToken}`)
        .expect(200);

      expect(response.body.data).toEqual(outstandingSummary);
      expect(mocks.getOutstandingSummaryService).toHaveBeenCalledWith(LANDLORD_ID);
    });

    it("returns empty overdue list when no invoices are outstanding", async () => {
      mocks.getOutstandingSummaryService.mockResolvedValue({
        outstandingTotal: 0,
        overdueInvoices: [],
      });

      const response = await request(app)
        .get("/api/v1/dashboard/outstanding")
        .set("Authorization", `Bearer ${landlordToken}`)
        .expect(200);

      expect(response.body.data).toEqual({
        outstandingTotal: 0,
        overdueInvoices: [],
      });
    });
  });

  // --- US-DASH-04: GET /api/v1/dashboard/upcoming-expirations ---------------

  describe("US-DASH-04 — upcoming lease expirations", () => {
    it("rejects an unauthenticated request", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/upcoming-expirations")
        .expect(401);

      expect(response.body.error).toMatchObject({ code: "UNAUTHENTICATED" });
      expect(mocks.getUpcomingExpirationsService).not.toHaveBeenCalled();
    });

    it("rejects a Tenant from accessing the dashboard", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/upcoming-expirations")
        .set("Authorization", `Bearer ${tenantToken}`)
        .expect(403);

      expect(response.body.error).toMatchObject({ code: "FORBIDDEN" });
      expect(mocks.getUpcomingExpirationsService).not.toHaveBeenCalled();
    });

    it("returns upcoming lease expirations for the landlord", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/upcoming-expirations")
        .set("Authorization", `Bearer ${landlordToken}`)
        .expect(200);

      expect(response.body.data).toEqual(upcomingExpirations);
      expect(mocks.getUpcomingExpirationsService).toHaveBeenCalledWith(LANDLORD_ID);
    });

    it("returns an empty array when no leases are approaching expiration", async () => {
      mocks.getUpcomingExpirationsService.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/v1/dashboard/upcoming-expirations")
        .set("Authorization", `Bearer ${landlordToken}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });
});
