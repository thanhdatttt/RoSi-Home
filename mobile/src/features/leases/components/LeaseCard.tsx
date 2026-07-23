import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { vnd } from '@/core/formatters';
import { Room } from '@/features/rooms/models/room';
import { Badge, Card, colors, spacing } from '@/ui';
import { Lease } from '../models/lease';

export function LeaseCard({ lease, room }: { lease: Lease; room?: Room }) {
  return (
    <Card
      onPress={() =>
        router.push({ pathname: '/lease-detail', params: { leaseId: lease.id } })
      }
    >
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>
            {lease.tenantName} · P{room?.name ?? '—'}
          </Text>
          <Text style={styles.muted}>
            {lease.startDate} — {lease.endDate}
          </Text>
          <Text style={styles.rent}>{vnd(lease.rent)} / tháng</Text>
        </View>
        <Badge label={lease.status} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  copy: { flex: 1, gap: spacing.xs },
  title: { color: colors.text, fontSize: 15, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: 12 },
  rent: { color: colors.text, fontSize: 13, fontWeight: '700' },
});
