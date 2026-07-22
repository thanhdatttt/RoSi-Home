import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";
import { colors, radius } from "../theme";

type ButtonVariant = "primary" | "secondary" | "danger";

interface AppButtonProps {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
  variant?: ButtonVariant;
}

export function AppButton({
  disabled = false,
  label,
  loading = false,
  onPress,
  variant = "primary",
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[`${variant}Button`],
        (disabled || loading) && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.surface : colors.primary}
        />
      ) : (
        <Text style={[styles.buttonText, styles[`${variant}ButtonText`]]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

interface FieldProps extends Pick<
  TextInputProps,
  "autoCapitalize" | "keyboardType" | "onSubmitEditing" | "secureTextEntry"
> {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}

export function Field({ label, ...inputProps }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#8A9A93"
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

export function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function Notice({
  message,
  tone,
}: {
  message: string;
  tone: "error" | "success";
}) {
  return (
    <View style={[styles.notice, tone === "error" ? styles.error : styles.success]}>
      <Text
        accessibilityRole="alert"
        style={tone === "error" ? styles.errorText : styles.successText}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.small,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 18,
  },
  primaryButton: { backgroundColor: colors.primary },
  secondaryButton: {
    backgroundColor: colors.primarySoft,
    borderColor: "#B9DFC9",
    borderWidth: 1,
  },
  dangerButton: {
    backgroundColor: colors.surface,
    borderColor: "#F4B9B4",
    borderWidth: 1,
  },
  buttonDisabled: { opacity: 0.55 },
  buttonPressed: { opacity: 0.82 },
  buttonText: { fontSize: 15, fontWeight: "700" },
  primaryButtonText: { color: colors.surface },
  secondaryButtonText: { color: colors.primaryDark },
  dangerButtonText: { color: colors.danger },
  fieldGroup: { gap: 7 },
  fieldLabel: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.small,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.large,
    borderWidth: 1,
    padding: 22,
  },
  notice: { borderRadius: radius.small, padding: 12 },
  error: { backgroundColor: colors.dangerSoft },
  success: { backgroundColor: colors.primarySoft },
  errorText: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  successText: { color: colors.primaryDark, fontSize: 14, lineHeight: 20 },
});
