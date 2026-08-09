import { useCallback, useEffect, useState } from 'react';

import { Invoice } from '@/features/billing/models/billing';

import { useTenantBillingRepository } from '../api/tenant-billing.repository';

export function useTenantInvoices() {
  const { getInvoices } = useTenantBillingRepository();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInvoices();
      setInvoices(result.invoices);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể tải hóa đơn.',
      );
    } finally {
      setLoading(false);
    }
  }, [getInvoices]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { invoices, loading, error, refresh, apiBlocked: true };
}

export function useTenantInvoice(invoiceId: string) {
  const { getInvoice, getInvoicePdf } = useTenantBillingRepository();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(Boolean(invoiceId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!invoiceId) {
      setInvoice(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setInvoice(await getInvoice(invoiceId));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể tải chi tiết hóa đơn.',
      );
    } finally {
      setLoading(false);
    }
  }, [getInvoice, invoiceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { invoice, loading, error, refresh, getInvoicePdf };
}
