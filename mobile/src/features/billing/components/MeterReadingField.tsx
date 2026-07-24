import { StyleSheet, Text, View } from 'react-native';

import { Card, Field, KeyValueRow, colors, spacing } from '@/ui';

export type MeterReadingFieldProps = {
  title: string;
  previousValue: string;
  value: string;
  unit: string;
  price: number;
  onPreviousChange: (value: string) => void;
  onChange: (value: string) => void;
  previousError?: string;
  error?: string;
};

export function MeterReadingField({
  title,
  previousValue,
  value,
  unit,
  price,
  onPreviousChange,
  onChange,
  previousError,
  error,
}: MeterReadingFieldProps) {
  const previous = Number(previousValue);
  const current = Number(value);
  const hasReadings =
    previousValue.trim().length > 0 && value.trim().length > 0;
  const usage: number | null =
    hasReadings &&
    Number.isFinite(previous) &&
    Number.isFinite(current) &&
    current >= previous
      ? Math.max(current - previous, 0)
      : null;

  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      <Field
        label={`Chỉ số kỳ trước (${unit})`}
        keyboardType="decimal-pad"
        value={previousValue}
        onChangeText={onPreviousChange}
        error={previousError}
        hint="Dùng làm baseline nếu phòng chưa có chỉ số trước đó."
      />
      <Field
        label={`Chỉ số kỳ này (${unit})`}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChange}
        error={error}
      />
      <View style={styles.summary}>
        <KeyValueRow
          label="Tiêu thụ"
          value={usage === null ? '—' : `${usage} ${unit}`}
        />
        <KeyValueRow
          label={`Tạm tính · ${new Intl.NumberFormat('vi-VN').format(price)} đ/${unit}`}
          value={
            usage === null
              ? '—'
              : `${new Intl.NumberFormat('vi-VN').format(usage * price)} đ`
          }
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  summary: { gap: spacing.xs },
});
