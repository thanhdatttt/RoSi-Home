import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getOccupancyService,
  getOutstandingSummaryService,
  getRevenueService,
  getUpcomingExpirationsService,
} from "../../../src/modules/dashboard/service.js";

const mocks = vi.hoisted(() => ({
  findOutstandingInvoicesForLandlord: vi.fn(),
  sumOutstandingAmountForLandlord: vi.fn(),
  getOccupiedRoomCount: vi.fn(),
  getRevenueSummary: vi.fn(),
  listUpcomingExpirationsService: vi.fn(),
  businessDate: vi.fn(),
}));

vi.mock("../../../src/modules/dashboard/repository.js", () => ({
  findOutstandingInvoicesForLandlord: mocks.findOutstandingInvoicesForLandlord,
  sumOutstandingAmountForLandlord: mocks.sumOutstandingAmountForLandlord,
  getOccupiedRoomCount: mocks.getOccupiedRoomCount,
}));

vi.mock("../../../src/modules/reports/repository.js", () => ({
  getRevenueSummary: mocks.getRevenueSummary,
}));

vi.mock("../../../src/modules/leases/service.js", () => ({
  listUpcomingExpirationsService: mocks.listUpcomingExpirationsService,
}));

vi.mock("../../../src/lib/businessDate.js", () => ({
  businessDate: mocks.businessDate,
}));

describe("Dashboard Service Unit Tests", () => {
  const landlordId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOccupancyService", () => {
    it("returns total and occupied room count", async () => {
      mocks.getOccupiedRoomCount.mockResolvedValue({ totalRooms: 10, occupiedRooms: 5 });
      
      const result = await getOccupancyService(landlordId);
      
      expect(result).toEqual({ totalRooms: 10, occupiedRooms: 5 });
      expect(mocks.getOccupiedRoomCount).toHaveBeenCalledWith(landlordId);
    });
  });

  describe("getRevenueService", () => {
    it("returns expected and collected revenue and parses month correctly", async () => {
      mocks.getRevenueSummary.mockResolvedValue({ 
        expectedRevenue: { rent: 5000000 }, 
        actualCollectedRevenue: { rent: 2000000 } 
      });
      
      const result = await getRevenueService(landlordId, "2026-07");
      
      expect(result).toEqual({ 
        expectedRevenue: { rent: 5000000 }, 
        collectedRevenue: { rent: 2000000 }, 
        month: "2026-07" 
      });
      
      // 2026-07-01 00:00:00 to 2026-07-31 23:59:59
      const calls = mocks.getRevenueSummary.mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe(landlordId);
      expect(calls[0][1]).toBe("month");
      expect(calls[0][2]).toBeInstanceOf(Date);
      expect(calls[0][2].getFullYear()).toBe(2026);
      expect(calls[0][2].getMonth()).toBe(6); // 0-indexed, so 6 is July
      expect(calls[0][2].getDate()).toBe(1);
      
      expect(calls[0][3]).toBeInstanceOf(Date);
      expect(calls[0][3].getFullYear()).toBe(2026);
      expect(calls[0][3].getMonth()).toBe(6);
      expect(calls[0][3].getDate()).toBe(31);
      
      expect(calls[0][4]).toBe("2026-07");
    });
  });

  describe("getOutstandingSummaryService", () => {
    it("returns outstanding total and filters overdue invoices correctly", async () => {
      mocks.businessDate.mockReturnValue("2026-07-15");
      mocks.sumOutstandingAmountForLandlord.mockResolvedValue(10000000);
      mocks.findOutstandingInvoicesForLandlord.mockResolvedValue([
        {
          invoiceId: "inv-1",
          tenantFullName: "Tenant 1",
          roomName: "Room 1",
          dueDate: "2026-07-10", // overdue
          totalAmount: 4000000,
        },
        {
          invoiceId: "inv-2",
          tenantFullName: "Tenant 2",
          roomName: "Room 2",
          dueDate: "2026-07-20", // not overdue
          totalAmount: 6000000,
        },
      ]);
      
      const result = await getOutstandingSummaryService(landlordId);
      
      expect(result.outstandingTotal).toBe(10000000);
      expect(result.overdueInvoices).toHaveLength(1);
      expect(result.overdueInvoices[0]).toEqual({
        invoiceId: "inv-1",
        tenant: "Tenant 1",
        room: "Room 1",
        dueDate: "2026-07-10",
        amount: 4000000,
      });
    });
  });

  describe("getUpcomingExpirationsService", () => {
    it("delegates to listUpcomingExpirationsService", async () => {
      mocks.listUpcomingExpirationsService.mockResolvedValue([{ leaseId: "lease-1" }]);
      
      const result = await getUpcomingExpirationsService(landlordId);
      
      expect(result).toEqual([{ leaseId: "lease-1" }]);
      expect(mocks.listUpcomingExpirationsService).toHaveBeenCalledWith(landlordId);
    });
  });
});
