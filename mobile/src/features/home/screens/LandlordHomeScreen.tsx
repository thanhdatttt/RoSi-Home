import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useApiSession } from '@/core/api';
import {
  billingPeriodLabel,
  currentBillingPeriod,
} from '@/features/billing/models/billing';
import { Badge, Button, Card, Notice, Screen, Title, colors, spacing } from '@/ui';
import { SectionLabel, SummaryGrid } from '@/ui/patterns';
import { useHomeSummary } from '../hooks/use-home-summary';

export function LandlordHomeScreen() {
  const period = currentBillingPeriod();
  const { enabled } = useApiSession();
  const { rooms, occupied, pendingMaintenance, pendingTasks } = useHomeSummary();
  const occupiedRoom = rooms.find((room) => room.status === 'Đang thuê');

  return (
    <Screen>
      <View style={styles.heading}>
        <Title subtitle="Theo dõi việc cần làm trong kỳ hiện tại.">Xin chào</Title>
        <Badge label="Chủ nhà" />
      </View>
      <Notice
        title={enabled ? 'DỮ LIỆU BACKEND' : 'CHẾ ĐỘ MOCK'}
        message={
          enabled
            ? 'Tổng phòng và bảo trì lấy từ backend; số hóa đơn chờ chưa có API danh sách.'
            : 'Dữ liệu chỉ được lưu trong bộ nhớ khi ứng dụng đang chạy.'
        }
      />
      <SummaryGrid
        items={[
          { label: 'Tổng phòng', value: String(rooms.length) },
          { label: 'Đang thuê', value: String(occupied) },
          { label: 'Phòng trống', value: String(rooms.length - occupied) },
          { label: 'Việc cần xử lý', value: String(pendingTasks) },
        ]}
      />
      <SectionLabel>Việc cần làm</SectionLabel>
      <Card
        onPress={() =>
          occupiedRoom
            ? router.push({
                pathname: '/meter-reading',
                params: { roomId: occupiedRoom.id },
              })
            : undefined
        }
      >
        <Text style={styles.cardTitle}>
          Chốt chỉ số tháng {billingPeriodLabel(period)}
        </Text>
        <Text style={styles.muted}>Nhập điện nước cho phòng đang thuê.</Text>
      </Card>
      <Card onPress={() => router.push('/maintenance')}>
        <Text style={styles.cardTitle}>{pendingMaintenance} yêu cầu bảo trì đang mở</Text>
        <Text style={styles.muted}>Xem và cập nhật trạng thái xử lý.</Text>
      </Card>
      <SectionLabel>Truy cập nhanh</SectionLabel>
      <View style={styles.actions}>
        <Button label="Hợp đồng" variant="secondary" onPress={() => router.push('/leases')} />
        <Button label="Hóa đơn" variant="secondary" onPress={() => router.push('/invoices')} />
        <Button label="Dashboard" variant="secondary" onPress={() => router.push('/dashboard')} />
        <Button label="Bất động sản" onPress={() => router.push('/(tabs)')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: 14 },
  actions: { gap: spacing.sm },
});
