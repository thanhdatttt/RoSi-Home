import { MaintenanceRequest } from '../models/maintenance';

export const initialMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'm1',
    roomId: 'r2',
    title: 'Máy lạnh không mát',
    description: 'Máy chạy nhưng không lạnh, có tiếng kêu nhỏ từ dàn lạnh.',
    createdAt: '22/07/2026',
    status: 'Mới',
  },
  {
    id: 'm2',
    roomId: 'r3',
    title: 'Rò nước nhà vệ sinh',
    description: 'Nước rò ở chân bồn rửa.',
    createdAt: '20/07/2026',
    status: 'Đang xử lý',
  },
];
