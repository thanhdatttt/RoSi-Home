import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/ui/theme';

export type BadgeProps = { label: string };

export function Badge({ label }: BadgeProps) {
  const good = label === 'Trống' || label === 'Đang áp dụng';
  const backgroundColor = good
    ? colors.successSoft
    : label === 'Đang thuê'
      ? colors.occupiedSoft
      : colors.neutralSoft;
  const color = good
    ? colors.success
    : label === 'Đang thuê'
      ? colors.primary
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
