import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { vnd } from '@/core/formatters';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { useSettingsData } from '@/features/settings/hooks/use-settings';
import { Badge, Button, Card, EmptyState, colors, spacing } from '@/ui';
import { useProperties } from '../hooks/use-properties';

type PropertyTab = 'rooms' | 'utilities' | 'surcharges';
type RoomFilter = 'all' | 'vacant' | 'occupied';

export function PropertyDetailScreen() {
  const { id = 'p1' } = useLocalSearchParams<{ id?: string }>();
  const { properties } = useProperties();
  const { rooms } = useRooms();
  const { surcharges, utilityRates, toggleSurcharge } = useSettingsData();
  const [tab, setTab] = useState<PropertyTab>('rooms');
  const [roomFilter, setRoomFilter] = useState<RoomFilter>('all');
  const property = properties.find((item) => item.id === id) ?? properties[0];
  const propertyRooms = rooms.filter((room) => room.propertyId === property?.id);
  const propertySurcharges = surcharges.filter((item) => item.propertyId === property?.id);
  const rate = utilityRates.find((item) => item.propertyId === property?.id);
  const vacantCount = propertyRooms.filter((room) => room.status === 'Trống').length;
  const occupiedCount = propertyRooms.filter((room) => room.status === 'Đang thuê').length;
  const filteredRooms = propertyRooms.filter(
    (room) =>
      roomFilter === 'all' ||
      (roomFilter === 'vacant' && room.status === 'Trống') ||
      (roomFilter === 'occupied' && room.status === 'Đang thuê'),
  );
  const stopSurcharge = (surchargeId: string) =>
    Alert.alert('Ngừng áp dụng phụ phí?', 'Dữ liệu cũ vẫn được giữ lại.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Ngừng áp dụng',
        style: 'destructive',
        onPress: () => toggleSurcharge(surchargeId),
      },
    ]);

  const roomFilters = [
    { key: 'all', label: `Tất cả · ${propertyRooms.length}` },
    { key: 'vacant', label: `Trống · ${vacantCount}` },
    { key: 'occupied', label: `Đang thuê · ${occupiedCount}` },
  ] as const;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable accessibilityLabel="Quay lại" hitSlop={8} style={styles.headerAction} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text numberOfLines={1} style={styles.detailTitle}>{property?.name ?? 'Bất động sản'}</Text>
          <Pressable style={styles.headerAction} onPress={() => router.push('/property-form')}>
            <Text style={styles.editText}>Sửa</Text>
          </Pressable>
        </View>
        <Text numberOfLines={2} style={styles.address}>{property?.address}</Text>
        <View style={styles.segment}>
          {([
            { key: 'rooms', label: 'Phòng' },
            { key: 'utilities', label: 'Điện nước' },
            { key: 'surcharges', label: 'Phụ phí' },
          ] as const).map((item) => (
            <Pressable
              key={item.key}
              style={[styles.segmentItem, tab === item.key && styles.segmentItemActive]}
              onPress={() => setTab(item.key)}
            >
              <Text style={[styles.segmentText, tab === item.key && styles.segmentTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        {tab === 'rooms' ? (
          <View style={[styles.segment, styles.roomFilter]}>
            {roomFilters.map((item) => (
              <Pressable
                key={item.key}
                style={[styles.segmentItem, roomFilter === item.key && styles.segmentItemActive]}
                onPress={() => setRoomFilter(item.key)}
              >
                <Text style={[styles.segmentText, roomFilter === item.key && styles.segmentTextActive]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'rooms' ? (
          <>
            <View style={styles.actions}>
              <Button label="Thêm phòng" onPress={() => router.push('/room-form')} />
              <Button label="Tạo nhiều phòng" variant="secondary" onPress={() => router.push('/bulk-rooms')} />
            </View>
            {filteredRooms.length === 0 ? (
              <EmptyState title="Không có phòng phù hợp" description="Thử chọn bộ lọc khác hoặc thêm phòng mới." />
            ) : (
              filteredRooms.map((room) => (
                <Card
                  key={room.id}
                  onPress={() => router.push({ pathname: '/room-detail', params: { roomId: room.id } })}
                >
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.cardTitle}>Phòng {room.name}</Text>
                      <Text style={styles.muted}>{vnd(room.rent)} / tháng</Text>
                    </View>
                    <Badge label={room.status} />
                  </View>
                </Card>
              ))
            )}
          </>
        ) : null}
        {tab === 'utilities' ? (
          <>
            <Card>
              <Text style={styles.cardTitle}>Giá điện</Text>
              <Text style={styles.rateValue}>{vnd(rate?.electricityRate ?? 3500)} / kWh</Text>
              <Text style={styles.muted}>Áp dụng từ {rate?.effectiveFrom ?? '01/08/2026'}</Text>
            </Card>
            <Card>
              <Text style={styles.cardTitle}>Giá nước</Text>
              <Text style={styles.rateValue}>{vnd(rate?.waterRate ?? 18000)} / m³</Text>
              <Text style={styles.muted}>Tính {rate?.waterMethod.toLowerCase() ?? 'theo đồng hồ'}</Text>
            </Card>
            <Button label="Chỉnh sửa giá điện nước" onPress={() => router.push('/utility-rates')} />
          </>
        ) : null}
        {tab === 'surcharges' ? (
          <>
            <Button label="Thêm phụ phí" onPress={() => router.push('/surcharge-form')} />
            {propertySurcharges.length === 0 ? (
              <EmptyState title="Chưa có phụ phí" description="Thêm Internet, vệ sinh hoặc chi phí định kỳ khác." />
            ) : (
              propertySurcharges.map((item) => (
                <Card key={item.id}>
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.muted}>{vnd(item.amount)} / tháng</Text>
                    </View>
                    <Badge label={item.status} />
                  </View>
                  <Button
                    label={item.status === 'Đang áp dụng' ? 'Ngừng áp dụng' : 'Áp dụng lại'}
                    variant="secondary"
                    onPress={() =>
                      item.status === 'Đang áp dụng'
                        ? stopSurcharge(item.id)
                        : toggleSurcharge(item.id)
                    }
                  />
                </Card>
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.background },
  headerRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerAction: { width: 52, minHeight: 44, alignItems: 'flex-start', justifyContent: 'center' },
  backIcon: { fontSize: 34, lineHeight: 36, color: colors.text },
  detailTitle: { flex: 1, fontSize: 24, fontWeight: '800', textAlign: 'center', color: colors.text },
  editText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  address: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  content: { padding: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 4 },
  roomFilter: { marginTop: spacing.sm },
  segmentItem: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  segmentItemActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  segmentText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  segmentTextActive: { color: colors.text },
  actions: { gap: spacing.sm, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  muted: { fontSize: 14, color: colors.textSecondary },
  rateValue: { fontSize: 20, fontWeight: '800', color: colors.text },
});
