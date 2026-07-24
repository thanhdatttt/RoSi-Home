export type RoomStatus = 'Trống' | 'Đang thuê';
export type Room = {
  id: string;
  propertyId: string;
  name: string;
  rent: number;
  status: RoomStatus;
};
