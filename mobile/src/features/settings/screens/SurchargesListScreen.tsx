import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { vnd } from '@/core/formatters';
import { Badge, Button, Card, EmptyState, Screen, Title, colors, spacing } from '@/ui';
import { useSettingsData } from '../hooks/use-settings';

export function SurchargesListScreen() {
  const { surcharges, toggleSurcharge } = useSettingsData();
  const [empty, setEmpty] = useState(false);
  const stop = (id: string) =>
    Alert.alert('Ngừng áp dụng phụ phí?', 'Dữ liệu cũ vẫn được giữ lại.', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Ngừng áp dụng', style: 'destructive', onPress: () => toggleSurcharge(id) },
    ]);

  return (
    <Screen>
      <Title>Phụ phí</Title>
      <View style={styles.actions}>
        <Button label="Thêm phụ phí" onPress={() => router.push('/surcharge-form')} />
        <Button label={empty ? 'Hiện dữ liệu' : 'Empty state'} variant="secondary" onPress={() => setEmpty((value) => !value)} />
      </View>
      {empty ? (
        <EmptyState title="Chưa có phụ phí" description="Thêm Internet, vệ sinh hoặc chi phí định kỳ khác." />
      ) : (
        surcharges.map((item) => (
          <Card key={item.id}>
            <View style={styles.between}>
              <View>
                <Text style={styles.heading}>{item.name}</Text>
                <Text style={styles.muted}>{vnd(item.amount)} / tháng</Text>
              </View>
              <Badge label={item.status} />
            </View>
            <Button
              label={item.status === 'Đang áp dụng' ? 'Ngừng áp dụng' : 'Áp dụng lại'}
              variant="secondary"
              onPress={() => item.status === 'Đang áp dụng' ? stop(item.id) : toggleSurcharge(item.id)}
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  between: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  heading: { fontSize: 16, fontWeight: '800', color: colors.text },
  muted: { fontSize: 14, color: colors.textSecondary },
});
