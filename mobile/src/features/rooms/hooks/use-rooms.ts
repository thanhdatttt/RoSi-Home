import { useRoomsRepository } from '../api/rooms.repository';

export function useRooms() {
  return useRoomsRepository();
}

export function useRoom(roomId: string) {
  const repository = useRoomsRepository();
  return repository.rooms.find((room) => room.id === roomId);
}
