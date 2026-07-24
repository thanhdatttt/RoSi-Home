import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { vnd } from '@/core/formatters';
import {
  billingPeriodLabel,
  currentBillingPeriod,
} from '@/features/billing/models/billing';
import { Card, EmptyState, Feedback, Notice, Screen, Title, colors } from '@/ui';
import { SectionLabel, SummaryGrid } from '@/ui/patterns';
import { useDashboard } from '../hooks/use-dashboard';

export function DashboardScreen() {
  const period = currentBillingPeriod();
  const {
    remote,
    error,
    rooms,
    invoices,
    expected,
    collected,
    outstanding,
    overdueCount,
    occupied,
    expiring,
  } = useDashboard();
  if (error) {
    return <Screen><Feedback type="error" message={error} /></Screen>;
  }
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
      <Title subtitle={`Kỳ xem: Tháng ${billingPeriodLabel(period)}`}>Dashboard</Title>
      <Notice
        title={remote ? 'DỮ LIỆU BACKEND' : 'CHẾ ĐỘ MOCK'}
        message={
          remote
            ? 'Công nợ và hợp đồng sắp hết hạn lấy từ dashboard API.'
            : 'Các chỉ số chỉ là dữ liệu minh họa.'
        }
      />
      <SummaryGrid
        items={
          remote
            ? [
                { label: 'Phòng đang thuê', value: `${occupied}/${rooms.length}` },
                { label: 'Còn phải thu', value: vnd(outstanding) },
                { label: 'Hóa đơn quá hạn', value: String(overdueCount) },
                { label: 'Sắp hết hạn', value: String(expiring) },
              ]
            : [
                { label: 'Phòng đang thuê', value: `${occupied}/${rooms.length}` },
                { label: 'Doanh thu dự kiến', value: vnd(expected) },
                { label: 'Đã thu', value: vnd(collected) },
                { label: 'Còn phải thu', value: vnd(expected - collected) },
              ]
        }
      />
      <SectionLabel>Cần chú ý</SectionLabel>
      <Card onPress={() => router.push('/invoices')}>
        <Text style={styles.title}>
          {remote
            ? `${overdueCount} hóa đơn quá hạn`
            : `${invoices.filter((invoice) => invoice.status !== 'Đã thanh toán').length} hóa đơn chưa hoàn tất`}
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
