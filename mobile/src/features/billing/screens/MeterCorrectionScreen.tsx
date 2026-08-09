import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useApiSession } from '@/core/api';
import { vnd } from '@/core/formatters';
import {
  Button,
  Card,
  EmptyState,
  Feedback,
  Field,
  Notice,
  Screen,
  Success,
  Title,
  colors,
  spacing,
} from '@/ui';

import {
  correctMeterReading,
  listMeterReadings,
  MeterReadingView,
} from '../api/meters.service';
import { billingPeriodLabel } from '../models/billing';

function ReadingCorrectionCard({
  reading,
  onCorrected,
}: {
  reading: MeterReadingView;
  onCorrected(): Promise<void>;
}) {
  const { client } = useApiSession();
  const [value, setValue] = useState(String(reading.value));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const numericValue = Number(value);
  const invalid =
    !value.trim() ||
    !Number.isFinite(numericValue) ||
    numericValue < (reading.previousValue ?? 0);

  const submit = async () => {
    if (invalid || numericValue === reading.value) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await correctMeterReading(client, reading.id, numericValue);
      await onCorrected();
      setSaved(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể hiệu chỉnh chỉ số.',
      );
    } finally {
      setSaving(false);
    }
  };

  const label = reading.utilityType === 'Electricity' ? 'Điện' : 'Nước';
  const unit = reading.utilityType === 'Electricity' ? 'kWh' : 'm³';
  return (
    <Card>
      <Text style={styles.cardTitle}>{label}</Text>
      <Text style={styles.meta}>
        Kỳ trước: {reading.previousValue ?? '—'} {unit} · Đơn giá:{' '}
        {vnd(reading.unitRate ?? 0)}
      </Text>
      <Field
        label={`Chỉ số hiệu chỉnh (${unit})`}
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
        error={
          invalid
            ? `Chỉ số phải lớn hơn hoặc bằng ${reading.previousValue ?? 0}`
            : undefined
        }
      />
      {error ? <Notice title="Không thể hiệu chỉnh" message={error} /> : null}
      {saved ? <Success message={`Đã hiệu chỉnh chỉ số ${label.toLowerCase()}`} /> : null}
      <Button
        label={saving ? 'Đang hiệu chỉnh…' : `Hiệu chỉnh ${label.toLowerCase()}`}
        disabled={saving || invalid || numericValue === reading.value}
        onPress={() => void submit()}
      />
    </Card>
  );
}

export function MeterCorrectionScreen() {
  const { client } = useApiSession();
  const { roomId = '', period = '' } = useLocalSearchParams<{
    roomId?: string;
    period?: string;
  }>();
  const [readings, setReadings] = useState<MeterReadingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReadings(await listMeterReadings(client, roomId, period));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể tải chỉ số.',
      );
    } finally {
      setLoading(false);
    }
  }, [client, period, roomId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading) return <Screen><Feedback type="loading" /></Screen>;
  if (error) {
    return (
      <Screen>
        <Feedback type="error" message={error} onRetry={() => void refresh()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title subtitle={`Tháng ${billingPeriodLabel(period)}`}>
        Hiệu chỉnh chỉ số
      </Title>
      <Notice
        title="CHỈ ÁP DỤNG CHO HÓA ĐƠN NHÁP"
        message="Giá trị cũ vẫn được giữ để kiểm toán; backend tạo bản ghi thay thế và tính lại hóa đơn nháp."
      />
      {readings.length === 0 ? (
        <EmptyState
          title="Không có chỉ số"
          description="Không tìm thấy chỉ số điện nước của kỳ này."
        />
      ) : (
        readings.map((reading) => (
          <ReadingCorrectionCard
            key={reading.id}
            reading={reading}
            onCorrected={refresh}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.xs,
  },
});
