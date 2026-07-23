import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Room } from '@/features/rooms/models/room';
import { Badge, Card, colors, spacing } from '@/ui';
import { MaintenanceRequest } from '../models/maintenance';

export function MaintenanceCard({
  request,
  room,
}: {
  request: MaintenanceRequest;
  room?: Room;
}) {
  return (
    <Card
      onPress={() =>
        router.push({ pathname: '/maintenance-detail', params: { requestId: request.id } })
      }
    >
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{request.title}</Text>
          <Text style={styles.muted}>
            P{room?.name ?? '—'} · gửi {request.createdAt}
          </Text>
        </View>
        <Badge label={request.status} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  copy: { flex: 1, gap: spacing.xs },
  title: { color: colors.text, fontSize: 15, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: 12 },
});
