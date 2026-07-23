import { useMockAppData } from '@/core/data/MockAppDataProvider';

export function useHomeSummary() {
  const { rooms, maintenanceRequests, invoices } = useMockAppData();
  const occupied = rooms.filter((room) => room.status === 'Đang thuê').length;
  const pendingMaintenance = maintenanceRequests.filter(
    (request) => request.status !== 'Hoàn tất',
  ).length;
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== 'Đã thanh toán').length;
  return {
    rooms,
    occupied,
    pendingMaintenance,
    pendingInvoices,
    pendingTasks: pendingMaintenance + pendingInvoices,
  };
}
