import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, Notice, Screen, Title, colors, spacing } from '@/ui';
import { SectionLabel, SummaryGrid } from '@/ui/patterns';
import { useHomeSummary } from '../hooks/use-home-summary';

export function LandlordHomeScreen() {
  const { rooms, occupied, pendingMaintenance, pendingTasks } = useHomeSummary();

  return (
    <Screen>
      <View style={styles.heading}>
        <Title subtitle="Theo dõi việc cần làm trong kỳ hiện tại.">Xin chào, Anh An</Title>
        <Badge label="Phase 2" />
      </View>
      <Notice
        title="CONCEPT · CHƯA TÍCH HỢP BACKEND"
        message="Dữ liệu và thao tác ở nhóm này chỉ được lưu trong bộ nhớ khi ứng dụng đang chạy."
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
      <Card onPress={() => router.push({ pathname: '/meter-reading', params: { roomId: 'r2' } })}>
        <Text style={styles.cardTitle}>Chốt chỉ số tháng 07/2026</Text>
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
