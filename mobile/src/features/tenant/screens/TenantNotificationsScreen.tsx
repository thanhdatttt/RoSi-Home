import { StyleSheet, Text } from 'react-native';

import { Badge, Card, Notice, Screen, Title, colors, spacing } from '@/ui';

const groups = [
  ['Hóa đơn', 'Kỳ mới, sắp đến hạn, quá hạn'],
  ['Hợp đồng', 'Sắp hết hạn và thay đổi'],
  ['Bảo trì', 'Cập nhật tiến trình xử lý'],
  ['Thông báo chung', 'Tin từ chủ nhà'],
] as const;

export function TenantNotificationsScreen() {
  return (
    <Screen>
      <Title>Thông báo</Title>
      <Notice
        title="API-BLOCKED"
        message="Chưa có API danh sách hoặc đánh dấu thông báo đã đọc. Ứng dụng không tạo thông báo giả."
      />
      {groups.map(([title, description]) => (
        <Card key={title}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <Badge label="Đang hoàn thiện" />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.xs,
  },
});
