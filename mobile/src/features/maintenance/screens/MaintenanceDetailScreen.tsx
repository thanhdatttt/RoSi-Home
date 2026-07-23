import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useRooms } from '@/features/rooms/hooks/use-rooms';
import {
  Badge,
  Button,
  Card,
  Feedback,
  Notice,
  Screen,
  Success,
  Title,
  colors,
} from '@/ui';
import { SectionLabel, Timeline } from '@/ui/patterns';
import { useMaintenanceRequests } from '../hooks/use-maintenance';
import { MaintenanceStatus } from '../models/maintenance';

export function MaintenanceDetailScreen() {
  const { requestId = 'm1' } = useLocalSearchParams<{ requestId?: string }>();
  const { requests: maintenanceRequests, updateStatus } = useMaintenanceRequests();
  const { rooms } = useRooms();
  const [saved, setSaved] = useState(false);
  const request = maintenanceRequests.find((item) => item.id === requestId);

  if (!request) {
    return <Screen><Feedback type="error" message="Không tìm thấy yêu cầu bảo trì" /></Screen>;
  }

  const room = rooms.find((item) => item.id === request.roomId);
  const nextStatus: MaintenanceStatus | null =
    request.status === 'Mới'
      ? 'Đang xử lý'
      : request.status === 'Đang xử lý'
        ? 'Hoàn tất'
        : null;

  const advance = () => {
    if (!nextStatus) return;
    updateStatus(request.id, nextStatus);
    setSaved(true);
  };

  return (
    <Screen>
      <Title subtitle={`Phòng ${room?.name ?? '—'} · gửi ${request.createdAt}`}>
        Chi tiết bảo trì
      </Title>
      <Notice
        title="CONCEPT · CHƯA TÍCH HỢP BACKEND"
        message="Không gửi push notification hoặc tải ảnh trong luồng mock này."
      />
      {saved ? <Success message="Đã cập nhật trạng thái bảo trì" /> : null}
      <Badge label={request.status} />
      <Card>
        <Text style={styles.title}>{request.title}</Text>
        <Text style={styles.description}>{request.description}</Text>
      </Card>
      <SectionLabel>Lịch sử xử lý</SectionLabel>
      <Timeline
        items={[
          { title: 'Đã tiếp nhận yêu cầu', date: request.createdAt },
          ...(request.status !== 'Mới'
            ? [{ title: 'Bắt đầu xử lý', date: '23/07/2026' }]
            : []),
          ...(request.status === 'Hoàn tất'
            ? [{ title: 'Đã hoàn tất', date: '24/07/2026' }]
            : []),
        ]}
      />
      {nextStatus ? (
        <Button
          label={nextStatus === 'Đang xử lý' ? 'Bắt đầu xử lý' : 'Đánh dấu hoàn tất'}
          onPress={advance}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  description: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
});
