import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/ui/theme';

export type KeyValueRowProps = {
  label: string;
  value: string;
  detail?: string;
};

export function KeyValueRow({ label, value, detail }: KeyValueRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  copy: { flex: 1, gap: spacing.xs },
  label: { color: colors.text, fontSize: 14, fontWeight: '700' },
  detail: { color: colors.textSecondary, fontSize: 12 },
  value: { color: colors.text, fontSize: 14, fontWeight: '800', textAlign: 'right' },
});
