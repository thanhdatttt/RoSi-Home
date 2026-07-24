import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useApiSession } from '@/core/api';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import {
  EmptyState,
  Feedback,
  Notice,
  Screen,
  SegmentedControl,
  Title,
} from '@/ui';

import { MaintenanceCard } from '../components/MaintenanceCard';
import { useMaintenanceRequests } from '../hooks/use-maintenance';
import { MaintenanceStatus } from '../models/maintenance';

type Filter = 'all' | MaintenanceStatus;

export function MaintenanceListScreen() {
  const { enabled } = useApiSession();
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const {
    requests: maintenanceRequests,
    loading,
    error,
  } = useMaintenanceRequests();
  const { rooms } = useRooms();
  const [filter, setFilter] = useState<Filter>('all');

  if (loading) return <Screen><Feedback type="loading" /></Screen>;
  if (error) return <Screen><Feedback type="error" message={error} /></Screen>;

  const visible = maintenanceRequests.filter(
    (request) =>
      (!roomId || request.roomId === roomId) &&
      (filter === 'all' || request.status === filter),
  );

  return (
    <Screen>
      <Title subtitle={roomId ? 'Lọc theo phòng đã chọn' : 'Tất cả bất động sản'}>Bảo trì</Title>
      <Notice
        title={enabled ? 'DỮ LIỆU BACKEND' : 'CHẾ ĐỘ MOCK'}
        message={
          enabled
            ? 'Landlord chỉ xem và cập nhật yêu cầu thuộc bất động sản của mình.'
            : 'Yêu cầu được tạo sẵn và chỉ cập nhật trong bộ nhớ.'
        }
      />
      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Tất cả' },
          { value: 'Mới', label: 'Mới' },
          { value: 'Đang xử lý', label: 'Đang xử lý' },
          { value: 'Hoàn tất', label: 'Hoàn tất' },
        ]}
      />
      {visible.length === 0 ? (
        <EmptyState title="Không có yêu cầu" description="Không có bảo trì phù hợp với bộ lọc." />
      ) : (
        visible.map((request) => (
          <MaintenanceCard
            key={request.id}
            request={request}
            room={rooms.find((room) => room.id === request.roomId)}
          />
        ))
      )}
    </Screen>
  );
}
