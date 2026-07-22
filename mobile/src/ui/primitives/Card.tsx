import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/ui/theme';

export type CardProps = PropsWithChildren<{ onPress?: () => void }>;

export function Card({ children, onPress }: CardProps) {
  const body = <View style={styles.card}>{children}</View>;

  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
