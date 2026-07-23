export type MaintenanceStatus = 'Mới' | 'Đang xử lý' | 'Hoàn tất';
export type MaintenanceRequest = {
  id: string;
  roomId: string;
  title: string;
  description: string;
  createdAt: string;
  status: MaintenanceStatus;
};
