import { businessDate } from "../../lib/businessDate.js";
import {
  findOutstandingInvoicesForLandlord,
  sumOutstandingAmountForLandlord,
  getOccupiedRoomCount,
  findActiveLeaseForTenantUser,
  findNextPaymentDueForLease,
  getActiveUtilitiesForProperty,
  getActiveSurchargesForProperty,
  type OutstandingInvoiceRow,
} from "./repository.js";
import { listUpcomingExpirationsService } from "../leases/service.js";
import type { UpcomingExpirationView } from "../leases/service.js";
import { getRevenueSummary } from "../reports/repository.js";

export type OverdueInvoiceView = {
  invoiceId: string;
  tenant: string;
  room: string;
  dueDate: string;
  amount: number;
};

export type TenantDashboardSummary = {
  leaseId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  startDate: string;
  endDate: string;
  agreedRent: number;
  deposit: number;
  status: string;
  nextPayment: {
    invoiceId: string;
    amount: number;
    dueDate: string;
  } | null;
  utilities: {
    electricityRatePerKwh: number;
    waterBillingMethod: string;
    waterRatePerM3: number | null;
    waterFlatAmountPerTenant: number | null;
  } | null;
  surcharges: {
    name: string;
    monthlyAmount: number;
  }[];
} | null;

export async function getTenantDashboardSummaryService(
  userId: string,
): Promise<TenantDashboardSummary> {
  const activeLease = await findActiveLeaseForTenantUser(userId);
  if (!activeLease) {
    return null;
  }

  const nextPayment = await findNextPaymentDueForLease(activeLease.leaseId);
  const utilities = await getActiveUtilitiesForProperty(activeLease.propertyId);
  const surcharges = await getActiveSurchargesForProperty(activeLease.propertyId);

  return {
    leaseId: activeLease.leaseId,
    propertyName: activeLease.propertyName,
    roomId: activeLease.roomId,
    roomName: activeLease.roomName,
    startDate: String(activeLease.startDate),
    endDate: String(activeLease.endDate),
    agreedRent: activeLease.agreedRent,
    deposit: activeLease.deposit,
    status: activeLease.status,
    nextPayment,
    utilities,
    surcharges,
  };
}

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
  
  const sumRevenue = (r: any) => (r?.rent || 0) + (r?.electricity || 0) + (r?.water || 0) + (r?.surcharges || 0);
  
  const currentExpected = sumRevenue(revenue.expectedRevenue);
  const currentCollected = sumRevenue(revenue.actualCollectedRevenue);
  const lastCollected = sumRevenue(lastMonthRevenue.actualCollectedRevenue);
  
  let growth = 0;
  if (lastCollected > 0) {
    growth = ((currentCollected - lastCollected) / lastCollected) * 100;
  } else if (currentCollected > 0) {
    growth = 100;
  }
  
  return {
    expectedRevenue: currentExpected,
    collectedRevenue: currentCollected,
    growthPercentage: Math.round(growth),
    month
  };
}
