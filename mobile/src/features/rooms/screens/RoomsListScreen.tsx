import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { vnd } from '@/core/formatters';
import { Badge, Button, Card, EmptyState, Screen, Title, colors, spacing } from '@/ui';
import { useRooms } from '../hooks/use-rooms';

export function RoomsListScreen() {
  const { rooms } = useRooms();
  const [empty, setEmpty] = useState(false);
  return (
    <Screen>
      <Title subtitle="Trạng thái thuê được cập nhật bằng mock state.">Danh sách phòng</Title>
      <View style={styles.actions}>
        <Button label="Thêm phòng" onPress={() => router.push('/room-form')} />
        <Button label="Tạo nhiều" variant="secondary" onPress={() => router.push('/bulk-rooms')} />
        <Button label={empty ? 'Hiện dữ liệu' : 'Empty state'} variant="secondary" onPress={() => setEmpty((value) => !value)} />
      </View>
      {empty ? (
        <EmptyState title="Chưa có phòng" description="Thêm một phòng hoặc tạo nhiều phòng cùng lúc." />
      ) : (
        rooms.map((room) => (
          <Card key={room.id} onPress={() => router.push({ pathname: '/room-detail', params: { roomId: room.id } })}>
            <View style={styles.row}>
              <View>
                <Text style={styles.title}>Phòng {room.name}</Text>
                <Text style={styles.muted}>{vnd(room.rent)} / tháng</Text>
              </View>
              <Badge label={room.status} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  muted: { fontSize: 14, color: colors.textSecondary },
});
