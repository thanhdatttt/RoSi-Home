import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/ui/theme';

export type PageTitleProps = PropsWithChildren<{ subtitle?: string }>;

export function PageTitle({ children, subtitle }: PageTitleProps) {
  return (
    <View style={styles.titleWrap}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  titleWrap: { marginBottom: spacing.sm },
  title: { fontSize: typography.heading, fontWeight: '800', color: colors.text },
  subtitle: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
