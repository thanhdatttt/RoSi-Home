import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/ui/theme';

export type SummaryItem = {
  label: string;
  value: string;
};

export function SummaryGrid({ items }: { items: readonly SummaryItem[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.tile}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function SectionLabel({ children }: PropsWithChildren) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    width: '48%',
    minHeight: 96,
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  value: { color: colors.text, fontSize: 20, fontWeight: '900' },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  sectionLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
});
