import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { vnd } from '@/core/formatters';
import { useLeases } from '@/features/leases/hooks/use-leases';
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

export function TenantLeasesScreen() {
  const { leases, loading, error, refresh } = useLeases();
  const [filter, setFilter] = useState<
    'all' | 'active' | 'ending' | 'ended'
  >('all');

  if (loading) return <Screen><Feedback type="loading" /></Screen>;
  if (error) {
    return (
      <Screen>
        <Feedback
          type="error"
          message={error}
          onRetry={() => void refresh()}
        />
      </Screen>
    );
  }

  const visibleLeases = leases.filter((lease) => {
    if (filter === 'active') return lease.status === 'Đang hiệu lực';
    if (filter === 'ending') return lease.status === 'Sắp hết hạn';
    if (filter === 'ended') return lease.status === 'Đã kết thúc';
    return true;
  });

  return (
    <Screen>
      <Title subtitle="Chỉ các hợp đồng liên kết với tài khoản của bạn.">
        Hợp đồng của tôi
      </Title>
      <Notice
        title="CHỈ XEM"
        message="Người thuê có thể xem hợp đồng; chỉ chủ nhà mới được sửa, gia hạn hoặc kết thúc hợp đồng."
      />
      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Tất cả' },
          { value: 'active', label: 'Hoạt động' },
          { value: 'ending', label: 'Sắp hết' },
          { value: 'ended', label: 'Đã hết' },
        ]}
      />
      {visibleLeases.length === 0 ? (
        <EmptyState
          title={
            leases.length === 0
              ? 'Chưa có hợp đồng'
              : 'Không có hợp đồng phù hợp'
          }
          description={
            leases.length === 0
              ? 'Liên hệ chủ nhà nếu hợp đồng của bạn chưa xuất hiện.'
              : 'Hãy chọn một trạng thái khác để xem hợp đồng.'
          }
        />
      ) : (
        visibleLeases.map((lease) => (
          <Card
            key={lease.id}
            onPress={() =>
              router.push({
                pathname: '/lease-detail',
                params: { leaseId: lease.id },
              })
            }
          >
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.title}>
                  {lease.propertyName ?? 'Bất động sản'}
                </Text>
                <Text style={styles.muted}>
                  Phòng {lease.roomName ?? '—'} · {lease.startDate} —{' '}
                  {lease.endDate}
                </Text>
                <Text style={styles.rent}>{vnd(lease.rent)} / tháng</Text>
              </View>
              <Badge label={lease.status} />
            </View>
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
  copy: { flex: 1, gap: spacing.xs },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  rent: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
