import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { vnd } from '@/core/formatters';
import { useLeases } from '@/features/leases/hooks/use-leases';
import { useMaintenanceRequests } from '@/features/maintenance/hooks/use-maintenance';
import { useProperties } from '@/features/properties/hooks/use-properties';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Feedback,
  KeyValueRow,
  Notice,
  Screen,
  Title,
  colors,
  spacing,
} from '@/ui';
import { SectionLabel } from '@/ui/patterns';
import { useRooms } from '../hooks/use-rooms';

export function RoomDetailScreen() {
  const { roomId = 'r2' } = useLocalSearchParams<{ roomId?: string }>();
  const { rooms } = useRooms();
  const { properties } = useProperties();
  const { leases } = useLeases();
  const { requests: maintenanceRequests } = useMaintenanceRequests();
  const room = rooms.find((item) => item.id === roomId);

  if (!room) {
    return (
      <Screen>
        <Feedback
          type="error"
          message="Không tìm thấy phòng"
          onRetry={() => router.replace('/rooms')}
        />
      </Screen>
    );
  }

  const property = properties.find((item) => item.id === room.propertyId);
  const lease = leases.find(
    (item) => item.roomId === room.id && item.status !== 'Đã kết thúc',
  );
  const maintenanceCount = maintenanceRequests.filter(
    (request) => request.roomId === room.id,
  ).length;

  return (
    <Screen>
      <Title subtitle={property?.name}>Phòng {room.name}</Title>
      <Notice
        title="CONCEPT · CHƯA TÍCH HỢP BACKEND"
        message="Hợp đồng, chỉ số, bảo trì và hóa đơn dùng mock state cục bộ."
      />
      <Card>
        <View style={styles.header}>
          <Text style={styles.title}>Thông tin phòng</Text>
          <Badge label={room.status} />
        </View>
        <KeyValueRow label="Giá thuê" value={`${vnd(room.rent)} / tháng`} />
        <KeyValueRow label="Diện tích" value={`${room.area} m²`} />
      </Card>
      <SectionLabel>Người thuê hiện tại</SectionLabel>
      {lease ? (
        <Card
          onPress={() =>
            router.push({ pathname: '/lease-detail', params: { leaseId: lease.id } })
          }
        >
          <Text style={styles.title}>{lease.tenantName}</Text>
          <Text style={styles.muted}>Hợp đồng đến {lease.endDate}</Text>
        </Card>
      ) : (
        <EmptyState
          title="Phòng chưa có người thuê"
          description="Tạo hợp đồng khi người thuê bắt đầu nhận phòng."
          action={
            <Button
              label="Tạo hợp đồng"
              onPress={() => router.push({ pathname: '/lease-form', params: { roomId: room.id } })}
            />
          }
        />
      )}
      <SectionLabel>Tác vụ phòng</SectionLabel>
      <View style={styles.actions}>
        <Button
          label="Nhập chỉ số điện nước"
          onPress={() =>
            router.push({ pathname: '/meter-reading', params: { roomId: room.id } })
          }
        />
        <Button
          label="Xem hóa đơn"
          variant="secondary"
          onPress={() => router.push({ pathname: '/invoices', params: { roomId: room.id } })}
        />
        <Button
          label={`Bảo trì · ${maintenanceCount}`}
          variant="secondary"
          onPress={() => router.push({ pathname: '/maintenance', params: { roomId: room.id } })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: 14 },
  actions: { gap: spacing.sm },
});
