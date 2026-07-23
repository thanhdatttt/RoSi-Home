import { Invoice } from '../models/billing';

export const initialInvoices: Invoice[] = [
  {
    id: 'i1',
    roomId: 'r2',
    tenantName: 'Trần Hoàng Minh',
    period: '07/2026',
    dueDate: '05/08/2026',
    status: 'Nháp',
    lines: [
      { label: 'Tiền thuê', amount: 3500000 },
      { label: 'Điện', detail: '118 kWh × 3.500 đ', amount: 413000 },
      { label: 'Nước', detail: '9 m³ × 18.000 đ', amount: 162000 },
      { label: 'Phụ phí', amount: 150000 },
    ],
  },
];
