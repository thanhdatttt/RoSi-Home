import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { vnd } from '@/core/formatters';
import { Card, EmptyState, Notice, Screen, Title, colors } from '@/ui';
import { SectionLabel, SummaryGrid } from '@/ui/patterns';
import { useDashboard } from '../hooks/use-dashboard';

export function DashboardScreen() {
  const { rooms, invoices, expected, collected, occupied, expiring } = useDashboard();
  if (rooms.length === 0) {
    return (
      <Screen>
        <Title>Dashboard</Title>
        <EmptyState
          title="Chưa có dữ liệu vận hành"
          description="Thêm bất động sản và phòng để xem tổng quan."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title subtitle="Kỳ xem: Tháng 07/2026">Dashboard</Title>
      <Notice
        title="CONCEPT · DỮ LIỆU MINH HỌA"
        message="Các chỉ số chưa lấy từ API và không phải báo cáo tài chính chính thức."
      />
      <SummaryGrid
        items={[
          { label: 'Phòng đang thuê', value: `${occupied}/${rooms.length}` },
          { label: 'Doanh thu dự kiến', value: vnd(expected) },
          { label: 'Đã thu', value: vnd(collected) },
          { label: 'Còn phải thu', value: vnd(expected - collected) },
        ]}
      />
      <SectionLabel>Cần chú ý</SectionLabel>
      <Card onPress={() => router.push('/invoices')}>
        <Text style={styles.title}>
          {invoices.filter((invoice) => invoice.status !== 'Đã thanh toán').length} hóa đơn chưa
          hoàn tất
        </Text>
        <Text style={styles.muted}>Mở danh sách để kiểm tra trạng thái.</Text>
      </Card>
      <Card onPress={() => router.push('/leases')}>
        <Text style={styles.title}>{expiring} hợp đồng sắp hết hạn</Text>
        <Text style={styles.muted}>Theo dõi thời hạn và nhắc gia hạn.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: 14 },
});
