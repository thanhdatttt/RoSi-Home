import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { useRooms } from '@/features/rooms/hooks/use-rooms';
import {
  Button,
  EmptyState,
  Feedback,
  Notice,
  Screen,
  SegmentedControl,
  Title,
} from '@/ui';

import { LeaseCard } from '../components/LeaseCard';
import { useLeases } from '../hooks/use-leases';
import { LeaseStatus } from '../models/lease';

type Filter = 'all' | LeaseStatus;

export function LeasesListScreen() {
  const { leases } = useLeases();
  const { rooms } = useRooms();
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Screen><Feedback type="loading" /></Screen>;

  const visible = leases.filter((lease) => filter === 'all' || lease.status === filter);
  return (
    <Screen>
      <Title subtitle="Người thuê, thời hạn và tiền cọc.">Hợp đồng</Title>
      <Notice
        title="CONCEPT · CHƯA TÍCH HỢP BACKEND"
        message="Tạo hợp đồng và nhắc gia hạn chỉ cập nhật mock state."
      />
      <Button label="Tạo hợp đồng" onPress={() => router.push('/lease-form')} />
      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Tất cả' },
          { value: 'Đang hiệu lực', label: 'Hiệu lực' },
          { value: 'Sắp hết hạn', label: 'Sắp hết' },
        ]}
      />
      {visible.length === 0 ? (
        <EmptyState
          title="Chưa có hợp đồng"
          description="Tạo hợp đồng khi người thuê bắt đầu nhận phòng."
        />
      ) : (
        visible.map((lease) => (
          <LeaseCard
            key={lease.id}
            lease={lease}
            room={rooms.find((room) => room.id === lease.roomId)}
          />
        ))
      )}
    </Screen>
  );
}
