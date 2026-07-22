import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/ui/theme';
import { Button } from '../primitives/Button';

export type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.empty}>
      <Text style={styles.errorMark}>!</Text>
      <Text style={styles.emptyTitle}>{message ?? 'Không thể tải dữ liệu'}</Text>
      {onRetry ? <Button label="Thử lại" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 48, gap: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },
  errorMark: { fontSize: 36, fontWeight: '900', color: colors.danger },
});
