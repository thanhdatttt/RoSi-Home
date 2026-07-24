import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useApiSession } from '@/core/api';
import { vnd } from '@/core/formatters';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import {
  Badge,
  Button,
  Card,
  Feedback,
  KeyValueRow,
  Notice,
  Screen,
  Success,
  Title,
} from '@/ui';
import { SectionLabel, Timeline } from '@/ui/patterns';
import { useLeases } from '../hooks/use-leases';

export function LeaseDetailScreen() {
  const { enabled } = useApiSession();
  const { leaseId } = useLocalSearchParams<{ leaseId?: string }>();
  const { leases } = useLeases();
  const { rooms } = useRooms();
  const [reminded, setReminded] = useState(false);
  const lease = leases.find((item) => item.id === leaseId);

  if (!lease) return <Screen><Feedback type="error" message="Không tìm thấy hợp đồng" /></Screen>;
  const room = rooms.find((item) => item.id === lease.roomId);

  return (
    <Screen>
      <Title subtitle={`${lease.tenantName} · Phòng ${room?.name ?? '—'}`}>
        Chi tiết hợp đồng
      </Title>
      <Notice
        title={enabled ? 'DỮ LIỆU BACKEND' : 'CHẾ ĐỘ MOCK'}
        message={
          enabled
            ? 'Backend đã trả chi tiết hợp đồng nhưng chưa có endpoint nhắc gia hạn thủ công.'
            : 'Không có chữ ký điện tử hoặc gửi thông báo thật.'
        }
      />
      {reminded ? <Success message="Đã gửi nhắc gia hạn mô phỏng" /> : null}
      <Badge label={lease.status} />
      <Card>
        <KeyValueRow label="Thời hạn" value={`${lease.startDate} — ${lease.endDate}`} />
        <KeyValueRow label="Tiền thuê" value={vnd(lease.rent)} />
        <KeyValueRow label="Tiền cọc" value={vnd(lease.deposit)} />
        <KeyValueRow label="Số điện thoại" value={lease.phone} />
      </Card>
      <SectionLabel>Lịch sử</SectionLabel>
      <Timeline
        items={[
          { title: 'Hợp đồng bắt đầu', date: lease.startDate },
          {
            title: 'Tài khoản người thuê đã cấp',
            date: lease.startDate,
            detail: enabled ? 'Do backend cấp khi tạo hợp đồng' : 'Dữ liệu mô phỏng',
          },
        ]}
      />
      <Button
        label={enabled ? 'Chưa có API nhắc gia hạn' : 'Nhắc gia hạn'}
        variant="secondary"
        disabled={enabled}
        onPress={() => setReminded(true)}
      />
    </Screen>
  );
}
