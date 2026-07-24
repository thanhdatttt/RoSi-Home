import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ApiListEnvelope, useApiSession } from '@/core/api';
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

type MaintenanceHistoryDto = {
  id: string;
  statusHistory: {
    toStatus: 'Pending' | 'InProgress' | 'Completed';
    changedAt: string;
  }[];
};

export function MaintenanceDetailScreen() {
  const { enabled, authenticated, client } = useApiSession();
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  const { requests: maintenanceRequests, updateStatus } = useMaintenanceRequests();
  const { rooms } = useRooms();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [statusHistory, setStatusHistory] = useState<
    MaintenanceHistoryDto['statusHistory']
  >([]);
  const request = maintenanceRequests.find((item) => item.id === requestId);

  useEffect(() => {
    if (!enabled || !authenticated || !request?.roomId) return;
    let active = true;
    void client
      .request<ApiListEnvelope<MaintenanceHistoryDto>>({
        path: `/api/v1/rooms/${request.roomId}/maintenance-requests?page=1&pageSize=100`,
      })
      .then((response) => {
        if (!active) return;
        setStatusHistory(
          response.data.find((item) => item.id === request.id)?.statusHistory ??
            [],
        );
      })
      .catch(() => {
        if (active) setStatusHistory([]);
      });
    return () => {
      active = false;
    };
  }, [
    authenticated,
    client,
    enabled,
    request?.id,
    request?.roomId,
    request?.status,
  ]);

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

  const advance = async () => {
    if (!nextStatus) return;
    setSaving(true);
    setSavingError(null);
    try {
      await updateStatus(request.id, nextStatus);
      setSaved(true);
    } catch (requestError) {
      setSavingError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể cập nhật trạng thái.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Title subtitle={`Phòng ${room?.name ?? '—'} · gửi ${request.createdAt}`}>
        Chi tiết bảo trì
      </Title>
      <Notice
        title={enabled ? 'ĐÃ KẾT NỐI BACKEND' : 'CHẾ ĐỘ MOCK'}
        message={
          enabled
            ? 'Trạng thái được kiểm tra theo quy tắc chuyển trạng thái của backend.'
            : 'Thao tác chỉ cập nhật dữ liệu trong bộ nhớ.'
        }
      />
      {savingError ? (
        <Notice title="Không thể cập nhật bảo trì" message={savingError} />
      ) : null}
      {saved ? <Success message="Đã cập nhật trạng thái bảo trì" /> : null}
      <Badge label={request.status} />
      <Card>
        <Text style={styles.title}>{request.title}</Text>
        <Text style={styles.description}>{request.description}</Text>
      </Card>
      <SectionLabel>Lịch sử xử lý</SectionLabel>
      <Timeline
        items={
          enabled
            ? [
                { title: 'Đã tiếp nhận yêu cầu', date: request.createdAt },
                ...statusHistory
                  .filter((entry) => entry.toStatus !== 'Pending')
                  .map((entry) => ({
                  title:
                    entry.toStatus === 'InProgress'
                      ? 'Bắt đầu xử lý'
                      : 'Đã hoàn tất',
                  date: entry.changedAt,
                  })),
              ]
            : [
                { title: 'Đã tiếp nhận yêu cầu', date: request.createdAt },
                ...(request.status !== 'Mới'
                  ? [{ title: 'Bắt đầu xử lý', date: '23/07/2026' }]
                  : []),
                ...(request.status === 'Hoàn tất'
                  ? [{ title: 'Đã hoàn tất', date: '24/07/2026' }]
                  : []),
              ]
        }
      />
      {nextStatus ? (
        <Button
          label={
            saving
              ? 'Đang cập nhật…'
              : nextStatus === 'Đang xử lý'
                ? 'Bắt đầu xử lý'
                : 'Đánh dấu hoàn tất'
          }
          disabled={saving}
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
