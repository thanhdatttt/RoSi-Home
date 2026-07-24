import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { Invoice, MeterReading } from '../models/billing';

export interface BillingRepository {
  invoices: Invoice[];
  meterReadings: MeterReading[];
  remote: boolean;
  loading: boolean;
  error: string | null;
  saveMeterReading(value: Omit<MeterReading, 'id'>): Promise<void>;
  createInvoice(
    value: Omit<Invoice, 'id' | 'status'>,
  ): Promise<string | null>;
  sendInvoice(id: string): Promise<void>;
}

export function useBillingRepository(): BillingRepository {
  const {
    invoices,
    meterReadings,
    remote,
    loading,
    error,
    saveMeterReading,
    createInvoice,
    sendInvoice,
  } = useMockAppData();
  return {
    invoices,
    meterReadings,
    remote,
    loading,
    error,
    saveMeterReading,
    createInvoice,
    sendInvoice,
  };
}
