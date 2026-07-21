import { businessDate } from "../../lib/businessDate.js";
import {
  findOutstandingInvoicesForLandlord,
  sumOutstandingAmountForLandlord,
  type OutstandingInvoiceRow,
} from "./repository.js";
import { listUpcomingExpirationsService } from "../leases/service.js";
import type { UpcomingExpirationView } from "../leases/service.js";

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
