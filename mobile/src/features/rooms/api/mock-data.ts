import { Room } from '../models/room';

export const initialRooms: Room[] = [
  { id: 'r1', propertyId: 'p1', name: '101', rent: 3500000, area: 24, status: 'Trống' },
  { id: 'r2', propertyId: 'p1', name: '102', rent: 3500000, area: 24, status: 'Đang thuê' },
  { id: 'r3', propertyId: 'p1', name: '201', rent: 3800000, area: 28, status: 'Trống' },
];
