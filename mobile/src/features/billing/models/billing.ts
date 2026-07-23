export type InvoiceStatus = 'Nháp' | 'Đã gửi' | 'Đã thanh toán';
export type MeterReading = {
  id: string;
  roomId: string;
  period: string;
  previousElectricity: number;
  electricity: number;
  previousWater: number;
  water: number;
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
