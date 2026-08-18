import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Link, useLocalSearchParams, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../../components/MobileFrame";
import { ArrowLeft, Pencil, Plus, DoorOpen, Zap, Droplets, Receipt, MapPin, ChevronRight, Trash2, BellRing } from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useAuth } from "../../../../../contexts/auth-context";
import {
  deleteRoom,
  getProperty,
  listRooms,
  type PropertyView,
  type RoomView,
} from "../../../../../features/portfolio/api";
import { useI18n } from "@/i18n/I18nProvider";

const PAGE_SIZE = 5;

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { formatVnd, statusLabel, t } = useI18n();

  const [property, setProperty] = useState<PropertyView | null>(null);
  const [rooms, setRooms] = useState<RoomView[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchInitialData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [propData, roomsResult] = await Promise.all([
        getProperty(token, id),
        listRooms(token, id, 1, PAGE_SIZE),
      ]);
      setProperty(propData);
      setRooms(roomsResult.data);
      setPage(1);
      setHasMore(roomsResult.meta.total > roomsResult.meta.page * roomsResult.meta.pageSize);
    } catch (err) {
      console.error("Failed to load property details", err);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [fetchInitialData])
  );

  const loadMoreRooms = async () => {
    if (!token || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const roomsResult = await listRooms(token, id, nextPage, PAGE_SIZE);
      setRooms(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const filteredNew = roomsResult.data.filter(d => !existingIds.has(d.id));
        return [...prev, ...filteredNew];
      });
      setPage(nextPage);
      setHasMore(roomsResult.meta.total > roomsResult.meta.page * roomsResult.meta.pageSize);
    } catch (err) {
      console.error("Failed to load more rooms", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const confirmDeleteRoom = (room: RoomView) => {
    Alert.alert(
      t('property.deleteRoom'),
      t('property.deleteRoomConfirmation', { name: room.name || t('property.unnamedRoom') }),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRoom(token, room.id);
              fetchInitialData();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete room");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <MobileFrame>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f8ff' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MobileFrame>
    );
  }

  if (!property) {
    return (
      <MobileFrame>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f8ff', paddingHorizontal: 24 }}>
          <Text style={{ color: '#94a3b8', textAlign: 'center' }}>{t('property.notFound')}</Text>
          <Link href="/landlord/properties" asChild>
            <TouchableOpacity style={{ marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f1f5f9', borderRadius: 8 }}>
              <Text style={{ fontWeight: '600' }}>{t('property.goBack')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </MobileFrame>
    );
  }

  const occupiedCount = property.occupied;

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          {/* Hero header */}
          <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 24, overflow: 'hidden', position: 'relative', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
            <LinearGradient
              colors={["#1e3a8a", "#0f172a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Link href="/landlord/properties" asChild>
                <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowLeft size={16} color="white" />
                </TouchableOpacity>
              </Link>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#60a5fa', fontWeight: '600' }}>{t('property.eyebrow')}</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#ffffff' }} numberOfLines={1}>{property.name}</Text>
              </View>
              <Link href={`/landlord/properties/${id}/edit`} asChild>
                <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                  <Pencil size={16} color="white" />
                </TouchableOpacity>
              </Link>
            </View>

            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MapPin size={14} color="rgba(255,255,255,0.7)" />
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }} numberOfLines={1}>{property.address}</Text>
            </View>

            {/* Stats row */}
            <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 12, alignItems: 'center', marginRight: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff' }}>{property.units}</Text>
                <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{t('property.rooms')}</Text>
              </View>
              <View style={{ flex: 1, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 12, alignItems: 'center', marginRight: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff' }}>{occupiedCount}/{property.units}</Text>
                <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{t('status.occupied')}</Text>
              </View>
              <View style={{ flex: 1, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff' }}>{property.units - occupiedCount}</Text>
                <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{t('status.vacant')}</Text>
              </View>
            </View>
          </View>

          {/* Quick config bar */}
          <View style={{ paddingHorizontal: 24, marginTop: -16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', padding: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <View style={{ flex: 1 }}>
                <ConfigLink href={`/landlord/properties/${id}/utilities`} icon={<Zap size={16} color="#2563eb" />} label={t('property.utilities')} />
              </View>
              <View style={{ flex: 1 }}>
                <ConfigLink href={`/landlord/properties/${id}/surcharges`} icon={<Receipt size={16} color="#2563eb" />} label={t('property.surcharges')} />
              </View>
              <View style={{ flex: 1 }}>
                <ConfigLink href={`/landlord/properties/${id}/reminders`} icon={<BellRing size={16} color="#2563eb" />} label={t('property.reminders')} />
              </View>
              <View style={{ flex: 1 }}>
                <ConfigLink href={`/landlord/properties/${id}/rooms/new`} icon={<Plus size={16} color="white" />} label={t('property.addRoom')} highlight />
              </View>
            </View>
          </View>

          {/* Rooms list */}
          <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' }}>{t('property.rooms')}</Text>
              <Link href={`/landlord/properties/${id}/rooms/new`} asChild>
                <TouchableOpacity>
                  <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600' }}>{t('property.add')}</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <View style={{ gap: 8 }}>
              {rooms.length === 0 ? (
                <View style={{ padding: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#e2e8f0', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#94a3b8' }}>{t('property.noRooms')}</Text>
                </View>
              ) : (
                rooms.map((r) => (
                  <Swipeable
                    key={r.id}
                    containerStyle={{ overflow: 'visible' }}
                    renderRightActions={() => (
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#ef4444',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: 80,
                          borderRadius: 16,
                          marginLeft: 12,
                        }}
                        onPress={() => confirmDeleteRoom(r)}
                      >
                        <Trash2 size={24} color="white" />
                      </TouchableOpacity>
                    )}
                  >
                    <Link href={`/landlord/properties/${id}/rooms/${r.id}`} asChild>
                      <TouchableOpacity style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ height: 44, width: 44, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <DoorOpen size={20} color="#2563eb" />
                        </View>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{r.name || t('property.unnamedRoom')}</Text>
                          <Text style={{ fontSize: 12, color: '#94a3b8' }} numberOfLines={1}>
                            {r.status === "Occupied" ? statusLabel(r.status) : t('property.noActiveLease')}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                          <Text style={{ fontSize: 14, fontWeight: '700' }}>{formatVnd(r.baseRent)}</Text>
                          <View style={{ marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: r.status === "Occupied" ? 'rgba(37,99,235,0.2)' : '#f1f5f9' }}>
                            <Text style={{ fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, color: r.status === "Occupied" ? '#2563eb' : '#94a3b8' }}>
                              {statusLabel(r.status)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Link>
                  </Swipeable>
                ))
              )}
              {!loading && hasMore && rooms.length > 0 && (
                <TouchableOpacity
                  onPress={loadMoreRooms}
                  disabled={loadingMore}
                  style={{ paddingVertical: 12, borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' }}
                >
                  {loadingMore ? <ActivityIndicator size="small" color="#2563eb" /> : <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 14 }}>{t('property.loadMore')}</Text>}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}

function ConfigLink({ href, icon, label, highlight }: { href: string; icon: React.ReactNode; label: string; highlight?: boolean }) {
  return (
    <Link href={href as any} asChild>
      <TouchableOpacity style={{ flexDirection: 'column', alignItems: 'center', gap: 6, paddingVertical: 8 }}>
        <View style={{ height: 40, width: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: highlight ? '#2563eb' : 'rgba(37,99,235,0.1)' }}>
          {icon}
        </View>
        <Text style={{ fontSize: 10, fontWeight: '600', color: '#0f172a', textAlign: 'center' }}>{label}</Text>
      </TouchableOpacity>
    </Link>
  );
}
