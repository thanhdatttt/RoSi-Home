import { StyleSheet, Text, View } from 'react-native';

import { Card, Field, KeyValueRow, colors, spacing } from '@/ui';

export type MeterReadingFieldProps = {
  title: string;
  previous: number;
  value: string;
  unit: string;
  price: number;
  onChange: (value: string) => void;
  error?: string;
};

export function MeterReadingField({
  title,
  previous,
  value,
  unit,
  price,
  onChange,
  error,
}: MeterReadingFieldProps) {
  const current = Number(value);
  const usage = Number.isFinite(current) ? Math.max(current - previous, 0) : 0;

  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.previous}>
        Kỳ trước: {new Intl.NumberFormat('vi-VN').format(previous)} {unit}
      </Text>
      <Field
        label={`Chỉ số mới (${unit})`}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
        error={error}
      />
      <View style={styles.summary}>
        <KeyValueRow label="Tiêu thụ" value={`${usage} ${unit}`} />
        <KeyValueRow
          label={`Tạm tính · ${new Intl.NumberFormat('vi-VN').format(price)} đ/${unit}`}
          value={`${new Intl.NumberFormat('vi-VN').format(usage * price)} đ`}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  previous: { color: colors.textSecondary, fontSize: 13 },
  summary: { gap: spacing.xs },
});
