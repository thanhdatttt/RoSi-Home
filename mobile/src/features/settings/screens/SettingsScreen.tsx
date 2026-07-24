import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useProperties } from '@/features/properties/hooks/use-properties';
import { Badge, Card, Screen, Title, colors, spacing } from '@/ui';

const conceptLinks: readonly {
  title: string;
  description: string;
  route: '/leases' | '/maintenance' | '/invoices' | '/dashboard';
}[] = [
  { title: 'Hợp đồng', description: 'Người thuê, thời hạn và tiền cọc', route: '/leases' },
  { title: 'Bảo trì', description: 'Tiếp nhận và cập nhật trạng thái', route: '/maintenance' },
  { title: 'Hóa đơn & VietQR', description: 'Chi tiết chi phí và mã thanh toán', route: '/invoices' },
  { title: 'Dashboard', description: 'Tổng quan vận hành', route: '/dashboard' },
];

export function SettingsScreen() {
  const { properties } = useProperties();
  const propertyId = properties[0]?.id;
  return (
    <Screen>
      <Title subtitle="Cấu hình nhanh cho nhà trọ.">Thiết lập</Title>
      <Card
        onPress={() =>
          router.push({
            pathname: '/utility-rates',
            params: { propertyId },
          })
        }
      >
        <Text style={styles.heading}>Giá điện nước</Text>
        <Text style={styles.muted}>Theo từng bất động sản</Text>
      </Card>
      <Card
        onPress={() =>
          router.push({ pathname: '/surcharges', params: { propertyId } })
        }
      >
        <Text style={styles.heading}>Phụ phí định kỳ</Text>
        <Text style={styles.muted}>Tạo, sửa hoặc ngừng áp dụng</Text>
      </Card>
      <Text style={styles.section}>Phase 2 · Concept</Text>
      {conceptLinks.map(({ title, description, route }) => (
        <Card key={title} onPress={() => router.push(route)}>
          <View style={styles.between}>
            <View style={styles.copy}>
              <Text style={styles.heading}>{title}</Text>
              <Text style={styles.muted}>{description}</Text>
            </View>
            <Badge label="Concept" />
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 16, fontWeight: '800', color: colors.text },
  muted: { fontSize: 14, color: colors.textSecondary },
  section: { fontSize: 18, fontWeight: '800', marginTop: spacing.lg, color: colors.text },
  between: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  copy: { flex: 1, gap: spacing.xs },
});
