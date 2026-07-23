import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/ui/theme';

export type NoticeProps = {
  title: string;
  message: string;
};

export function Notice({ title, message }: NoticeProps) {
  return (
    <View style={styles.notice}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    gap: spacing.xs,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  title: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  message: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
});
