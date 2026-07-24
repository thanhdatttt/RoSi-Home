import { router } from 'expo-router';
import { useState } from 'react';

import { useApiSession } from '@/core/api';
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
  const { enabled } = useApiSession();
  const { leases, loading, error } = useLeases();
  const { rooms } = useRooms();
  const [filter, setFilter] = useState<Filter>('all');

  if (loading) return <Screen><Feedback type="loading" /></Screen>;
  if (error) {
    return <Screen><Feedback type="error" message={error} /></Screen>;
  }

  const visible = leases.filter((lease) => filter === 'all' || lease.status === filter);
  return (
    <Screen>
      <Title subtitle="Người thuê, thời hạn và tiền cọc.">Hợp đồng</Title>
      <Notice
        title={enabled ? 'DỮ LIỆU BACKEND' : 'CHẾ ĐỘ MOCK'}
        message={
          enabled
            ? 'Danh sách được giới hạn theo tài khoản và quyền sở hữu.'
            : 'Dữ liệu chỉ được lưu trong bộ nhớ.'
        }
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
