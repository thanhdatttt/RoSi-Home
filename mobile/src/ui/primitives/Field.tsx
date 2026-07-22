import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius } from '@/ui/theme';

export type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export function Field({ label, error, hint, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.disabled}
        style={[styles.input, error && styles.inputError]}
        {...props}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 16,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12 },
  hint: { color: colors.textSecondary, fontSize: 12 },
});
