import { useBillingRepository } from '../api/billing.repository';

export function useInvoices() {
  return useBillingRepository();
}

export function useInvoice(invoiceId: string) {
  return useBillingRepository().invoices.find((invoice) => invoice.id === invoiceId);
}

export function useMeterReadings() {
  return useBillingRepository();
}
