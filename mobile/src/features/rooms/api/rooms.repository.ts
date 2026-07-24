import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { Room } from '../models/room';

export interface RoomsRepository {
  remote: boolean;
  rooms: Room[];
  loading: boolean;
  error: string | null;
  createRoom(value: Omit<Room, 'id' | 'status'>): Promise<Room>;
  createRooms(
    propertyId: string,
    prefix: string,
    start: number,
    count: number,
    rent: number,
  ): Promise<Room[]>;
}

export function useRoomsRepository(): RoomsRepository {
  const { remote, rooms, loading, error, addRoom, addRooms } = useMockAppData();
  return {
    remote,
    rooms,
    loading,
    error,
    createRoom: addRoom,
    createRooms: addRooms,
  };
}
