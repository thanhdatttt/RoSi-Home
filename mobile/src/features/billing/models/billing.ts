export type InvoiceStatus = 'Nháp' | 'Đã gửi' | 'Đã thanh toán';
export type MeterReading = {
  id: string;
  roomId: string;
  period: string;
  previousElectricity: number;
  electricity: number;
  previousWater: number;
  water: number;
  waterMetered?: boolean;
};
export type InvoiceLine = { label: string; detail?: string; amount: number };
export type Invoice = {
  id: string;
  roomId: string;
  tenantName: string;
  period: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
};

export const invoiceTotal = (invoice: Invoice) =>
  invoice.lines.reduce((total, line) => total + line.amount, 0);

export function currentBillingPeriod(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function previousBillingPeriod(period: string) {
  const [year, month] = period.split('-').map(Number);
  const previous = new Date(year, month - 2, 1);
  return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`;
}

export function billingPeriodLabel(period: string) {
  const [year, month] = period.split('-');
  return `${month}/${year}`;
}

export function defaultInvoiceDueDate(period: string) {
  const [year, month] = period.split('-').map(Number);
  const dueDate = new Date(year, month, 5);
  return `${String(dueDate.getDate()).padStart(2, '0')}/${String(
    dueDate.getMonth() + 1,
  ).padStart(2, '0')}/${dueDate.getFullYear()}`;
}
