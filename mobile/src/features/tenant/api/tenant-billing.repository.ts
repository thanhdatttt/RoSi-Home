import { useCallback } from 'react';

import { ApiEnvelope, ApiError, useApiSession } from '@/core/api';
import { Invoice } from '@/features/billing/models/billing';

import { TenantInvoiceDto } from './tenant-billing.dto';
import { toTenantInvoice } from './tenant-billing.mapper';

export type TenantInvoiceListState = {
  availability: 'api-blocked';
  invoices: Invoice[];
};

export interface TenantBillingRepository {
  getInvoices(): Promise<TenantInvoiceListState>;
  getInvoice(id: string): Promise<Invoice>;
  getInvoicePdf(id: string): Promise<ArrayBuffer>;
}

export function useTenantBillingRepository(): TenantBillingRepository {
  const { client, enabled } = useApiSession();

  const getInvoices = useCallback(
    async (): Promise<TenantInvoiceListState> => ({
      availability: 'api-blocked',
      invoices: [],
    }),
    [],
  );

  const getInvoice = useCallback(
    async (id: string) => {
      if (!enabled) {
        throw new ApiError(
          'Cần kết nối backend để tải chi tiết hóa đơn.',
          'configuration',
        );
      }
      const response = await client.request<ApiEnvelope<TenantInvoiceDto>>({
        path: `/api/v1/invoices/${id}`,
      });
      return toTenantInvoice(response.data);
    },
    [client, enabled],
  );

  const getInvoicePdf = useCallback(
    async (id: string) => {
      if (!enabled) {
        throw new ApiError(
          'Cần kết nối backend để tải PDF hóa đơn.',
          'configuration',
        );
      }
      return client.request<ArrayBuffer>({
        path: `/api/v1/invoices/${id}/pdf`,
        responseType: 'arrayBuffer',
      });
    },
    [client, enabled],
  );

  return { getInvoices, getInvoice, getInvoicePdf };
}
