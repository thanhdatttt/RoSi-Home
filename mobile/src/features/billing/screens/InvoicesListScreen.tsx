import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { vnd } from '@/core/formatters';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import {
  Badge,
  Card,
  EmptyState,
  Feedback,
  Notice,
  Screen,
  SegmentedControl,
  Title,
  colors,
  spacing,
} from '@/ui';
import { useInvoices } from '../hooks/use-billing';
import { InvoiceStatus, invoiceTotal } from '../models/billing';

type Filter = 'all' | InvoiceStatus;

export function InvoicesListScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const { invoices, remote, loading, error } = useInvoices();
  const { rooms } = useRooms();
  const [filter, setFilter] = useState<Filter>('all');

  if (loading) return <Screen><Feedback type="loading" /></Screen>;
  if (error) return <Screen><Feedback type="error" message={error} /></Screen>;

  const visible = invoices.filter(
    (invoice) =>
      (!roomId || invoice.roomId === roomId) &&
      (filter === 'all' || invoice.status === filter),
  );

  return (
    <Screen>
      <Title subtitle={roomId ? 'Lọc theo phòng đã chọn' : 'Tất cả bất động sản'}>Hóa đơn</Title>
      <Notice
        title={remote ? 'BACKEND CÒN THIẾU ENDPOINT' : 'CHẾ ĐỘ MOCK'}
        message={
          remote
            ? 'Backend chưa có GET /api/v1/invoices nên chưa thể tải danh sách hóa đơn.'
            : 'Gửi hóa đơn và trạng thái chỉ cập nhật trong dữ liệu mẫu.'
        }
      />
      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Tất cả' },
          { value: 'Nháp', label: 'Nháp' },
          { value: 'Đã gửi', label: 'Đã gửi' },
        ]}
      />
      {visible.length === 0 ? (
        <EmptyState
          title="Chưa có hóa đơn"
          description={
            remote
              ? 'Cần bổ sung API danh sách hóa đơn để hiển thị dữ liệu đã sinh.'
              : 'Nhập chỉ số cuối tháng để tạo hóa đơn dự kiến.'
          }
        />
      ) : (
        visible.map((invoice) => {
          const room = rooms.find((item) => item.id === invoice.roomId);
          return (
            <Card
              key={invoice.id}
              onPress={() =>
                router.push({ pathname: '/invoice-detail', params: { invoiceId: invoice.id } })
              }
            >
              <View style={styles.row}>
                <View style={styles.copy}>
                  <Text style={styles.title}>
                    P{room?.name ?? '—'} · Tháng {invoice.period}
                  </Text>
                  <Text style={styles.muted}>
                    {invoice.tenantName} · hạn {invoice.dueDate}
                  </Text>
                </View>
                <Text style={styles.amount}>{vnd(invoiceTotal(invoice))}</Text>
              </View>
              <Badge label={invoice.status} />
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  copy: { flex: 1, gap: spacing.xs },
  title: { color: colors.text, fontSize: 15, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: 12 },
  amount: { color: colors.text, fontSize: 14, fontWeight: '900' },
});
