import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { vnd } from '@/core/formatters';
import {
  Badge,
  Card,
  EmptyState,
  Feedback,
  KeyValueRow,
  Screen,
  Title,
  colors,
  spacing,
} from '@/ui';

import { usePaymentHistory } from '../hooks/use-payments';

export function PaymentHistoryScreen() {
  const { value, loading, error, refresh } = usePaymentHistory();
  if (loading) return <Screen><Feedback type="loading" /></Screen>;
  if (error || !value) {
    return (
      <Screen>
        <Feedback
          type="error"
          message={error ?? 'Không thể tải lịch sử thanh toán.'}
          onRetry={() => void refresh()}
        />
      </Screen>
    );
  }
  return (
    <Screen>
      <Title subtitle="Chỉ gồm hóa đơn đã gửi và các khoản đã xác nhận.">
        Thanh toán
      </Title>
      <Card>
        <KeyValueRow
          label="Tổng còn phải thu/trả"
          value={vnd(value.outstandingTotal)}
        />
      </Card>
      {value.entries.length === 0 ? (
        <EmptyState
          title="Chưa có lịch sử"
          description="Các hóa đơn đã gửi sẽ xuất hiện tại đây."
        />
      ) : (
        value.entries.map((entry) => (
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
              <View style={styles.copy}>
                <Text style={styles.title}>Kỳ {entry.billingPeriod}</Text>
                <Text style={styles.muted}>
                  Xác nhận: {entry.verifiedAt ?? 'Chưa xác nhận'}
                </Text>
              </View>
              <Text style={styles.amount}>{vnd(entry.amount)}</Text>
            </View>
            <Badge label={entry.status === 'Paid' ? 'Đã thanh toán' : 'Đã gửi'} />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  copy: { flex: 1, gap: spacing.xs },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: 12 },
  amount: { color: colors.text, fontSize: 15, fontWeight: '900' },
});
