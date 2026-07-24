import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { Button, Card, EmptyState, Feedback, Screen, Title, colors, spacing } from '@/ui';
import { useProperties } from '../hooks/use-properties';

export function PropertiesListScreen() {
  const { properties, loading, error, refresh } = useProperties();
  const { rooms } = useRooms();
  const [empty, setEmpty] = useState(false);

  if (loading) return <Screen><Feedback type="loading" /></Screen>;
  if (error) {
    return (
      <Screen>
        <Feedback
          type="error"
          message={error}
          onRetry={() => void refresh()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title subtitle="Quản lý phòng và chi phí theo từng địa chỉ.">Bất động sản</Title>
      <View style={styles.actions}>
        <Button label="Thêm bất động sản" onPress={() => router.push('/property-form')} />
        <Button
          label={empty ? 'Hiện dữ liệu' : 'Xem empty state'}
          variant="secondary"
          onPress={() => setEmpty((value) => !value)}
        />
      </View>
      {empty || properties.length === 0 ? (
        <EmptyState
          title="Chưa có bất động sản"
          description="Thêm nhà trọ đầu tiên để bắt đầu."
          action={<Button label="Thêm ngay" onPress={() => router.push('/property-form')} />}
        />
      ) : (
        properties.map((property) => (
          <Card
            key={property.id}
            onPress={() =>
              router.push({ pathname: '/property-detail', params: { id: property.id } })
            }
          >
            <Text style={styles.cardTitle}>{property.name}</Text>
            <Text style={styles.muted}>{property.address}</Text>
            <Text style={styles.meta}>
              {rooms.filter((room) => room.propertyId === property.id).length} phòng
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm, marginBottom: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  muted: { fontSize: 14, color: colors.textSecondary },
  meta: { fontSize: 12, color: colors.primary, fontWeight: '700' },
});
