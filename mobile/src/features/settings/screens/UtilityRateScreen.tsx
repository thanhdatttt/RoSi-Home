import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Field, Screen, Success, Title, colors, spacing } from '@/ui';
import { useSettingsData } from '../hooks/use-settings';

export function UtilityRateScreen() {
  const { utilityRates, saveUtilityRate } = useSettingsData();
  const current = utilityRates.find((item) => item.propertyId === 'p1');
  const [electricity, setElectricity] = useState(String(current?.electricityRate ?? 3500));
  const [water, setWater] = useState(String(current?.waterRate ?? 18000));
  const [flat, setFlat] = useState(current?.waterMethod === 'Theo người');
  const [done, setDone] = useState(false);

  return (
    <Screen>
      <Title subtitle="Áp dụng cho Nhà trọ Bình An.">Giá điện nước</Title>
      {done ? <Success message="Đã lưu giá điện nước" /> : null}
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
        disabled={Number(electricity) < 0 || Number(water) < 0}
        onPress={() => {
          saveUtilityRate({
            propertyId: 'p1',
            electricityRate: Number(electricity),
            waterMethod: flat ? 'Theo người' : 'Theo đồng hồ',
            waterRate: Number(water),
            effectiveFrom: '01/08/2026',
          });
          setDone(true);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 16, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', gap: spacing.sm },
});
