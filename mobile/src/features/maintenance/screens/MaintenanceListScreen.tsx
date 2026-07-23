import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

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
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const { requests: maintenanceRequests } = useMaintenanceRequests();
  const { rooms } = useRooms();
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Screen><Feedback type="loading" /></Screen>;

  const visible = maintenanceRequests.filter(
    (request) =>
      (!roomId || request.roomId === roomId) &&
      (filter === 'all' || request.status === filter),
  );

  return (
    <Screen>
      <Title subtitle={roomId ? 'Lọc theo phòng đã chọn' : 'Tất cả bất động sản'}>Bảo trì</Title>
      <Notice
        title="CONCEPT · CHƯA TÍCH HỢP BACKEND"
        message="Yêu cầu được tạo sẵn; chủ nhà chỉ cập nhật trạng thái mock."
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
