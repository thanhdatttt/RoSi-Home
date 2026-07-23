import { Lease } from '../models/lease';

export const initialLeases: Lease[] = [
  {
    id: 'l1',
    roomId: 'r2',
    tenantName: 'Trần Hoàng Minh',
    phone: '0909 123 456',
    identityNumber: '079204001234',
    email: 'minh@example.com',
    startDate: '01/01/2026',
    endDate: '31/12/2026',
    rent: 3500000,
    deposit: 7000000,
    status: 'Đang hiệu lực',
  },
];
