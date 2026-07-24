import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useProperties } from '@/features/properties/hooks/use-properties';
import {
  Button,
  Card,
  Feedback,
  Field,
  Notice,
  Screen,
  Success,
  Title,
  colors,
  spacing,
} from '@/ui';
import { useSettingsData } from '../hooks/use-settings';

export function UtilityRateScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { properties } = useProperties();
  const { utilityRates, saveUtilityRate } = useSettingsData();
  const selectedPropertyId = propertyId ?? properties[0]?.id;
  const selectedProperty = properties.find(
    (item) => item.id === selectedPropertyId,
  );
  const current = utilityRates.find(
    (item) => item.propertyId === selectedPropertyId,
  );
  const [electricity, setElectricity] = useState(String(current?.electricityRate ?? 3500));
  const [water, setWater] = useState(String(current?.waterRate ?? 18000));
  const [flat, setFlat] = useState(current?.waterMethod === 'Theo người');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);

  if (!selectedPropertyId) {
    return (
      <Screen>
        <Feedback
          type="error"
          message="Hãy tạo bất động sản trước khi thiết lập giá."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title subtitle={`Áp dụng cho ${selectedProperty?.name ?? 'bất động sản đã chọn'}.`}>
        Giá điện nước
      </Title>
      {done ? <Success message="Đã lưu giá điện nước" /> : null}
      {savingError ? (
        <Notice title="Không thể lưu đơn giá" message={savingError} />
      ) : null}
      <Card>
        <Text style={styles.heading}>Giá điện</Text>
        <Field label="Đơn giá (đ/kWh)" value={electricity} onChangeText={setElectricity} keyboardType="numeric" />
      </Card>
      <Card>
        <Text style={styles.heading}>Giá nước</Text>
        <View style={styles.row}>
          <Button label="Theo đồng hồ" variant={flat ? 'secondary' : 'primary'} onPress={() => setFlat(false)} />
          <Button label="Theo người" variant={flat ? 'primary' : 'secondary'} onPress={() => setFlat(true)} />
        </View>
        <Field
          label={flat ? 'Mức cố định (đ/người)' : 'Đơn giá (đ/m³)'}
          value={water}
          onChangeText={setWater}
          keyboardType="numeric"
        />
      </Card>
      <Button
        label="Lưu giá điện nước"
        disabled={
          Number(electricity) < 0 || Number(water) < 0 || saving
        }
        onPress={async () => {
          setSaving(true);
          setSavingError(null);
          try {
            await saveUtilityRate({
              propertyId: selectedPropertyId,
              electricityRate: Number(electricity),
              waterMethod: flat ? 'Theo người' : 'Theo đồng hồ',
              waterRate: Number(water),
              effectiveFrom: new Date().toISOString().slice(0, 10),
            });
            setDone(true);
          } catch (requestError) {
            setSavingError(
              requestError instanceof Error
                ? requestError.message
                : 'Không thể lưu đơn giá.',
            );
          } finally {
            setSaving(false);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 16, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', gap: spacing.sm },
});
