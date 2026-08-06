import { businessDate } from "../../lib/businessDate.js";
import {
  findOutstandingInvoicesForLandlord,
  sumOutstandingAmountForLandlord,
  type OutstandingInvoiceRow,
} from "./repository.js";
import { listUpcomingExpirationsService } from "../leases/service.js";
import type { UpcomingExpirationView } from "../leases/service.js";
import { getOccupiedRoomCount } from "./repository.js";
import { getRevenueSummary } from "../reports/repository.js";

export type OverdueInvoiceView = {
  invoiceId: string;
  tenant: string;
  room: string;
  dueDate: string;
  amount: number;
};

export type OutstandingSummary = {
  outstandingTotal: number;
  overdueInvoices: OverdueInvoiceView[];
};

// US-DASH-03 — outstanding and overdue invoices for the dashboard.
export async function getOutstandingSummaryService(
  landlordId: string,
): Promise<OutstandingSummary> {
  const rows = await findOutstandingInvoicesForLandlord(landlordId);
  const outstandingTotal = await sumOutstandingAmountForLandlord(landlordId);

  const today = businessDate();
  const overdueInvoices: OverdueInvoiceView[] = rows
    .filter((r) => r.dueDate < today)
    .map((r) => ({
      invoiceId: r.invoiceId,
      tenant: r.tenantFullName,
      room: r.roomName,
      dueDate: r.dueDate,
      amount: r.totalAmount,
    }));

  return { outstandingTotal, overdueInvoices };
}

// US-DASH-04 — upcoming lease expirations, reusing the exact same service
// function as US-LEASE-06 to prevent divergence.
export async function getUpcomingExpirationsService(
  landlordId: string,
): Promise<UpcomingExpirationView[]> {
  return listUpcomingExpirationsService(landlordId);
}

// US-DASH-01
export async function getOccupancyService(landlordId: string) {
  return getOccupiedRoomCount(landlordId);
}

// US-DASH-02
export async function getRevenueService(landlordId: string, month: string) {
  const [year, monthStr] = month.split("-");
  const currentMonthDate = new Date(Number(year), Number(monthStr) - 1, 1);
  
  const periodStart = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
  const periodEnd = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const revenue = await getRevenueSummary(landlordId, "month", periodStart, periodEnd, month);
  
  const lastMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const lastPeriodStart = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
  const lastPeriodEnd = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const lastMonthRevenue = await getRevenueSummary(landlordId, "month", lastPeriodStart, lastPeriodEnd, lastMonthStr);
  
  let growth = 0;
  if (lastMonthRevenue.actualCollectedRevenue > 0) {
    growth = ((revenue.actualCollectedRevenue - lastMonthRevenue.actualCollectedRevenue) / lastMonthRevenue.actualCollectedRevenue) * 100;
  } else if (revenue.actualCollectedRevenue > 0) {
    growth = 100;
  }
  
  return {
    expectedRevenue: revenue.expectedRevenue,
    collectedRevenue: revenue.actualCollectedRevenue,
    growthPercentage: Math.round(growth),
    month
  };
}
