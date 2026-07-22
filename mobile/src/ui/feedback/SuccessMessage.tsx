import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/ui/theme';

export type SuccessMessageProps = { message: string };

export function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <View style={styles.success}>
      <Text style={styles.successText}>✓ {message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  success: { backgroundColor: colors.successSoft, padding: 12, borderRadius: radius.sm },
  successText: { color: colors.success, fontWeight: '700' },
});
