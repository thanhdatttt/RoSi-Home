import { useMockAppData } from '@/core/data/MockAppDataProvider';
import { invoiceTotal } from '@/features/billing/models/billing';

export function useDashboard() {
  const { rooms, invoices, leases } = useMockAppData();
  const expected = invoices.reduce((total, invoice) => total + invoiceTotal(invoice), 0);
  const collected = invoices
    .filter((invoice) => invoice.status === 'Đã thanh toán')
    .reduce((total, invoice) => total + invoiceTotal(invoice), 0);
  return {
    rooms,
    invoices,
    leases,
    expected,
    collected,
    occupied: rooms.filter((room) => room.status === 'Đang thuê').length,
    expiring: leases.filter((lease) => lease.status === 'Sắp hết hạn').length,
  };
}
