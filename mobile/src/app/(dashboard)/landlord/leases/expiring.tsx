import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../components/MobileFrame";
import { ArrowLeft, CalendarClock, ChevronRight } from "lucide-react-native";
import { useAuth } from "../../../../contexts/auth-context";
import {
  listUpcomingExpirations,
  type UpcomingExpirationView,
} from "../../../../features/leasing/api";

export default function Expiring() {
  const { token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<UpcomingExpirationView[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpirations = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await listUpcomingExpirations(token);
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchExpirations();
    }, [fetchExpirations])
  );

  const getDays = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Link href={"/(dashboard)/landlord/leases" as any} asChild>
              <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={16} color="black" />
              </TouchableOpacity>
            </Link>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Leases</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a' }}>Expiring soon</Text>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          <Text style={{ paddingHorizontal: 24, fontSize: 12, color: '#64748b', lineHeight: 18, marginBottom: 16 }}>
            Active leases in your portfolio expiring within the next 30 days. Ended leases are excluded.
          </Text>

          <View style={{ paddingHorizontal: 24, gap: 8 }}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 32 }} />
            ) : items.length === 0 ? (
              <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingVertical: 40 }}>
                No leases expiring in this window.
              </Text>
            ) : (
              items.map((l) => {
                const days = getDays(l.endDate);
                const isUrgent = days <= 15;

                return (
                  <TouchableOpacity
                    key={l.leaseId}
                    onPress={() => router.push({ pathname: "/(dashboard)/landlord/leases/[id]", params: { id: l.leaseId } } as any)}
                    activeOpacity={0.7}
                    style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                  >
                    <View style={{ height: 44, width: 44, borderRadius: 22, backgroundColor: isUrgent ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CalendarClock size={20} color={isUrgent ? '#ef4444' : '#2563eb'} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                      <Text style={{ fontWeight: '600', fontSize: 14, color: '#0f172a' }} numberOfLines={1}>{l.propertyName} · {l.roomName}</Text>
                      <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }} numberOfLines={1}>{l.tenantFullName}</Text>
                      <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Expires {l.endDate}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', flexShrink: 0, flexDirection: 'row', gap: 8 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: isUrgent ? '#ef4444' : '#2563eb' }}>{days}d</Text>
                      <ChevronRight size={16} color="#94a3b8" />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <Text style={{ paddingHorizontal: 24, marginTop: 24, fontSize: 11, color: '#94a3b8', lineHeight: 16 }}>
            Reminder timings (30 / 15 / 7 days) are configured per property under Property → Reminders.
          </Text>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
