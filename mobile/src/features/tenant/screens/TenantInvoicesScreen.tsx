import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { vnd } from '@/core/formatters';
import { usePaymentHistory } from '@/features/payments';
import {
  Badge,
  Card,
  EmptyState,
  Feedback,
  KeyValueRow,
  Screen,
  SegmentedControl,
  Title,
  colors,
  spacing,
} from '@/ui';

type InvoiceFilter = 'all' | 'unpaid' | 'paid';

export function TenantInvoicesScreen() {
  const { value, loading, error, refresh } = usePaymentHistory();
  const [filter, setFilter] = useState<InvoiceFilter>('all');
  if (loading) return <Screen><Feedback type="loading" /></Screen>;
  if (error || !value) {
    return (
      <Screen>
        <Feedback
          type="error"
          message={error ?? 'Không thể tải hóa đơn.'}
          onRetry={() => void refresh()}
        />
      </Screen>
    );
  }
  const visible = value.entries.filter(
    (entry) =>
      filter === 'all' ||
      (filter === 'paid' && entry.status === 'Paid') ||
      (filter === 'unpaid' && entry.status === 'Sent'),
  );
  return (
    <Screen>
      <Title subtitle="Chỉ hiển thị hóa đơn thuộc tài khoản của bạn.">
        Hóa đơn của tôi
      </Title>
      <Card>
        <KeyValueRow label="Tổng chưa thanh toán" value={vnd(value.outstandingTotal)} />
      </Card>
      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Tất cả' },
          { value: 'unpaid', label: 'Chưa trả' },
          { value: 'paid', label: 'Đã trả' },
        ]}
      />
      {visible.length === 0 ? (
        <EmptyState
          title="Chưa có hóa đơn"
          description="Hóa đơn đã gửi cho bạn sẽ xuất hiện tại đây."
        />
      ) : (
        visible.map((entry) => (
          <Card
            key={entry.invoiceId}
            onPress={() =>
              router.push({
                pathname: '/invoice-detail',
                params: { invoiceId: entry.invoiceId },
              })
            }
          >
            <View style={styles.row}>
              <Text style={styles.title}>Kỳ {entry.billingPeriod}</Text>
              <Text style={styles.amount}>{vnd(entry.amount)}</Text>
            </View>
            <Badge label={entry.status === 'Paid' ? 'Đã thanh toán' : 'Đã gửi'} />
            {entry.verifiedAt ? (
              <Text style={styles.muted}>Xác nhận lúc {entry.verifiedAt}</Text>
            ) : null}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  amount: { color: colors.text, fontSize: 15, fontWeight: '900' },
  muted: { color: colors.textSecondary, fontSize: 12 },
});
