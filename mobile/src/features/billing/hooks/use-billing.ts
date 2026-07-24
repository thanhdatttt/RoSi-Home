import { useEffect, useState } from 'react';

import { ApiEnvelope, useApiSession } from '@/core/api';
import { InvoiceDto, toInvoice } from '@/core/data/api-mappers';

import { useBillingRepository } from '../api/billing.repository';
import { Invoice } from '../models/billing';

export function useInvoices() {
  return useBillingRepository();
}

export function useInvoice(invoiceId: string) {
  const repository = useBillingRepository();
  const { enabled, authenticated, client } = useApiSession();
  const localInvoice = repository.invoices.find(
    (invoice) => invoice.id === invoiceId,
  );
  const [remoteInvoice, setRemoteInvoice] = useState<Invoice | undefined>();
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !authenticated || !invoiceId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    void client
      .request<ApiEnvelope<InvoiceDto>>({
        path: `/api/v1/invoices/${invoiceId}`,
      })
      .then((response) => {
        if (active) setRemoteInvoice(toInvoice(response.data));
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Không thể tải hóa đơn.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authenticated, client, enabled, invoiceId]);

  return {
    invoice: enabled ? remoteInvoice : localInvoice,
    remote: enabled,
    loading,
    error,
    sendInvoice: repository.sendInvoice,
  };
}

export function useMeterReadings() {
  return useBillingRepository();
}
