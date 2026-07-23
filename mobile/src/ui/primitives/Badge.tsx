import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/ui/theme';

export type BadgeTone = 'success' | 'info' | 'warning' | 'neutral' | 'danger';
export type BadgeProps = { label: string; tone?: BadgeTone };

export function Badge({ label, tone }: BadgeProps) {
  const resolvedTone =
    tone ??
    (['Trống', 'Đang áp dụng', 'Đã thanh toán', 'Hoàn tất'].includes(label)
      ? 'success'
      : ['Đang thuê', 'Đang hiệu lực', 'Đã gửi', 'Đang xử lý'].includes(label)
        ? 'info'
        : ['Sắp hết hạn', 'Mới', 'Nháp'].includes(label)
          ? 'warning'
          : 'neutral');
  const backgroundColor =
    resolvedTone === 'success'
      ? colors.successSoft
      : resolvedTone === 'info'
        ? colors.occupiedSoft
        : resolvedTone === 'warning'
          ? colors.surfaceAlt
          : resolvedTone === 'danger'
            ? colors.neutralSoft
            : colors.neutralSoft;
  const color =
    resolvedTone === 'success'
      ? colors.success
      : resolvedTone === 'info'
        ? colors.primary
        : resolvedTone === 'warning'
          ? colors.warning
          : resolvedTone === 'danger'
            ? colors.danger
            : colors.textSecondary;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
