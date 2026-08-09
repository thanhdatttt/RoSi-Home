import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { vnd } from '@/core/formatters';
import { useLeases } from '@/features/leases/hooks/use-leases';
import { useMaintenanceRequests } from '@/features/maintenance/hooks/use-maintenance';
import { useProfile } from '@/features/settings/hooks/use-profile';
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
import { SectionLabel, SummaryGrid } from '@/ui/patterns';

export function TenantHomeScreen() {
  const {
    leases,
    loading: leasesLoading,
    error: leasesError,
    refresh: refreshLeases,
  } = useLeases();
  const {
    requests,
    loading: maintenanceLoading,
    error: maintenanceError,
    refresh: refreshMaintenance,
  } = useMaintenanceRequests();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();
  const currentLease = leases.find((lease) => lease.status !== 'Đã kết thúc');
  const openMaintenance = requests.filter(
    (request) => request.status !== 'Hoàn tất',
  ).length;
  const loading = leasesLoading || maintenanceLoading || profileLoading;
  const error = leasesError ?? maintenanceError ?? profileError;

  if (loading) return <Screen><Feedback type="loading" /></Screen>;
  if (error) {
    return (
      <Screen>
        <Feedback
          type="error"
          message={error}
          onRetry={() => {
            void refreshMaintenance();
            void refreshLeases();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.appBar}>
        <Text style={styles.brand}>RosiHome</Text>
        <Pressable
          accessibilityLabel="Mở thông báo"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push('/notifications')}
          style={styles.notificationButton}
        >
          <Text style={styles.notificationMark}>●</Text>
        </Pressable>
      </View>
      <Title subtitle="Đây là thông tin nơi ở của bạn hôm nay.">
        Chào {profile.name || 'bạn'},
      </Title>
      <SectionLabel>Nơi ở hiện tại</SectionLabel>
      {currentLease ? (
        <Card
          onPress={() =>
            router.push({
              pathname: '/lease-detail',
              params: { leaseId: currentLease.id },
            })
          }
        >
          <View style={styles.cardHeader}>
            <View style={styles.copy}>
              <Text numberOfLines={2} style={styles.cardTitle}>
                {currentLease.propertyName ?? 'Bất động sản'}
              </Text>
              <Text numberOfLines={2} style={styles.muted}>
                Phòng {currentLease.roomName ?? '—'}
              </Text>
            </View>
            <Badge label={currentLease.status} />
          </View>
          <KeyValueRow
            label="Thời hạn"
            value={`${currentLease.startDate} — ${currentLease.endDate}`}
          />
          <KeyValueRow
            label="Tiền thuê"
            value={`${vnd(currentLease.rent)} / tháng`}
          />
        </Card>
      ) : (
        <EmptyState
          title="Chưa có hợp đồng đang hiệu lực"
          description="Hợp đồng sẽ xuất hiện sau khi chủ nhà liên kết tài khoản của bạn."
        />
      )}
      <SectionLabel>Việc cần làm</SectionLabel>
      <SummaryGrid
        items={[
          {
            label: 'Bảo trì đang mở',
            value: `${openMaintenance} yêu cầu`,
          },
          { label: 'Hóa đơn gần nhất', value: 'Chưa có dữ liệu' },
        ]}
      />
      <SectionLabel>Truy cập nhanh</SectionLabel>
      <View style={styles.actions}>
        <Button
          label="Xem hợp đồng"
          variant="secondary"
          onPress={() => router.push('/(tabs)')}
        />
        <Button
          label="Gửi yêu cầu bảo trì"
          disabled={!currentLease}
          onPress={() => router.push('/maintenance-create')}
        />
        <Button
          label="Xem hồ sơ"
          variant="secondary"
          onPress={() => router.push('/(tabs)/profile')}
        />
      </View>
      <SectionLabel>Hóa đơn gần nhất</SectionLabel>
      <Notice
        title="THANH TOÁN & VIETQR"
        message="Mở danh sách để xem số dư chưa thanh toán, VietQR và tải chứng từ cho hóa đơn đã gửi."
      />
      <Button
        label="Xem hóa đơn và thanh toán"
        variant="secondary"
        onPress={() => router.push('/invoices')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  brand: { color: colors.text, fontSize: 18, fontWeight: '900' },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  notificationMark: { color: colors.primary, fontSize: 18 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: { flex: 1, gap: spacing.xs },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: 14 },
  actions: { gap: spacing.sm },
});
