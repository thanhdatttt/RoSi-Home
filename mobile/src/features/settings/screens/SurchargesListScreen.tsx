import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { vnd } from '@/core/formatters';
import { useProperties } from '@/features/properties/hooks/use-properties';
import { Badge, Button, Card, EmptyState, Screen, Title, colors, spacing } from '@/ui';
import { useSettingsData } from '../hooks/use-settings';

export function SurchargesListScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { properties } = useProperties();
  const { surcharges, toggleSurcharge, remote } = useSettingsData();
  const selectedPropertyId = propertyId ?? properties[0]?.id;
  const visibleSurcharges = selectedPropertyId
    ? surcharges.filter((item) => item.propertyId === selectedPropertyId)
    : surcharges;
  const [empty, setEmpty] = useState(false);
  const runToggle = async (id: string) => {
    try {
      await toggleSurcharge(id);
    } catch (requestError) {
      Alert.alert(
        'Không thể cập nhật phụ phí',
        requestError instanceof Error
          ? requestError.message
          : 'Yêu cầu không thành công.',
      );
    }
  };
  const stop = (id: string) =>
    Alert.alert('Ngừng áp dụng phụ phí?', 'Dữ liệu cũ vẫn được giữ lại.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Ngừng áp dụng',
        style: 'destructive',
        onPress: () => void runToggle(id),
      },
    ]);

  return (
    <Screen>
      <Title>Phụ phí</Title>
      <View style={styles.actions}>
        <Button
          label="Thêm phụ phí"
          onPress={() =>
            router.push({
              pathname: '/surcharge-form',
              params: { propertyId: selectedPropertyId },
            })
          }
        />
        <Button label={empty ? 'Hiện dữ liệu' : 'Empty state'} variant="secondary" onPress={() => setEmpty((value) => !value)} />
      </View>
      {empty || visibleSurcharges.length === 0 ? (
        <EmptyState title="Chưa có phụ phí" description="Thêm Internet, vệ sinh hoặc chi phí định kỳ khác." />
      ) : (
        visibleSurcharges.map((item) => (
          <Card key={item.id}>
            <View style={styles.between}>
              <View>
                <Text style={styles.heading}>{item.name}</Text>
                <Text style={styles.muted}>{vnd(item.amount)} / tháng</Text>
              </View>
              <Badge label={item.status} />
            </View>
            <Button
              label={
                item.status === 'Đang áp dụng'
                  ? 'Ngừng áp dụng'
                  : remote
                    ? 'Backend chưa hỗ trợ áp dụng lại'
                    : 'Áp dụng lại'
              }
              variant="secondary"
              disabled={remote && item.status !== 'Đang áp dụng'}
              onPress={() =>
                item.status === 'Đang áp dụng'
                  ? stop(item.id)
                  : void runToggle(item.id)
              }
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
