export type LeaseStatus = 'Đang hiệu lực' | 'Sắp hết hạn' | 'Đã kết thúc';
export type Lease = {
  id: string;
  roomId: string;
  tenantName: string;
  phone: string;
  identityNumber: string;
  email: string;
  startDate: string;
  endDate: string;
  rent: number;
  deposit: number;
  status: LeaseStatus;
};
