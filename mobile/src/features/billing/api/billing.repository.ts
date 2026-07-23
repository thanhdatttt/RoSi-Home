import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { Invoice, MeterReading } from '../models/billing';

export interface BillingRepository {
  invoices: Invoice[];
  meterReadings: MeterReading[];
  saveMeterReading(value: Omit<MeterReading, 'id'>): void;
  createInvoice(value: Omit<Invoice, 'id' | 'status'>): string;
  sendInvoice(id: string): void;
}

export function useBillingRepository(): BillingRepository {
  const { invoices, meterReadings, saveMeterReading, createInvoice, sendInvoice } =
    useMockAppData();
  return { invoices, meterReadings, saveMeterReading, createInvoice, sendInvoice };
}
