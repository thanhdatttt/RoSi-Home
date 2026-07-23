import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/ui/theme';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  value: T;
  options: readonly SegmentOption<T>[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.root}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.item, selected && styles.itemSelected]}
          >
            <Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  item: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  itemSelected: { backgroundColor: colors.surface },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  labelSelected: { color: colors.primary },
});
