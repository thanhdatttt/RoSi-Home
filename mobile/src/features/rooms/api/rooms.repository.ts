import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { Room } from '../models/room';

export interface RoomsRepository {
  rooms: Room[];
  createRoom(value: Omit<Room, 'id' | 'status'>): void;
  createRooms(
    propertyId: string,
    prefix: string,
    start: number,
    count: number,
    rent: number,
  ): void;
}

export function useRoomsRepository(): RoomsRepository {
  const { rooms, addRoom, addRooms } = useMockAppData();
  return { rooms, createRoom: addRoom, createRooms: addRooms };
}
