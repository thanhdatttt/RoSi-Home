export type TenantInvoiceDto = {
  id: string;
  roomId: string;
  billingPeriod: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid';
  lineItems: {
    description: string;
    quantity: number | null;
    unitRate: number | null;
    amount: number;
  }[];
};
