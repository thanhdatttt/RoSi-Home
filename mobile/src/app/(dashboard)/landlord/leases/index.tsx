import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../components/MobileFrame";
import { ArrowLeft, Search, FileSignature, CalendarClock, UserPlus } from "lucide-react-native";
import { useAuth } from "../../../../contexts/auth-context";
import { apiRequest } from "../../../../lib/api";

const formatVND = (n: number) => {
  if (n == null || isNaN(n)) return '0';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const TABS = ["Active", "Ended", "All"] as const;

export default function LeasesList() {
  const { token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Active");
  const [q, setQ] = useState("");
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeases = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiRequest<any[]>('/leases?pageSize=100', { token });
      setLeases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchLeases();
    }, [fetchLeases])
  );

  const getDaysLeft = (endDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = endDateStr.split('-');
    const end = new Date(Number(y), Number(m) - 1, Number(d));
    return Math.round((end.getTime() - today.getTime()) / 86400000);
  };

  const items = leases
    .filter((l) => (tab === "All" ? true : tab === "Active" ? l.status === "Active" : l.status !== "Active"))
    .filter((l) => {
      const searchStr = `${l.tenant?.fullName || ""} ${l.propertyName} ${l.roomName}`.toLowerCase();
      return searchStr.includes(q.toLowerCase());
    });

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Link href="/landlord" asChild>
              <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={16} color="black" />
              </TouchableOpacity>
            </Link>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Portfolio</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a' }}>Leases</Text>
            </View>
            <Link href="/landlord/leases/new" asChild>
              <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={16} color="white" />
              </TouchableOpacity>
            </Link>
          </View>

          <View style={{ marginTop: 16, position: 'relative' }}>
            <View style={{ position: 'absolute', left: 14, top: 12, zIndex: 1 }}>
              <Search size={16} color="#94a3b8" />
            </View>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search tenant, property or room"
              placeholderTextColor="gray"
              style={{ width: '100%', height: 44, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 40, paddingRight: 16, fontSize: 14 }}
            />
          </View>

          <View style={{ marginTop: 12, flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 4, borderRadius: 12 }}>
            {TABS.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={{ flex: 1, height: 36, borderRadius: 8, backgroundColor: tab === t ? '#ffffff' : 'transparent', alignItems: 'center', justifyContent: 'center', shadowColor: tab === t ? '#000' : 'transparent', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: tab === t ? 1 : 0 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: tab === t ? '#0f172a' : '#64748b' }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32), gap: 8 }}>
          
          <TouchableOpacity 
            onPress={() => router.push("/(dashboard)/landlord/leases/expiring" as any)}
            activeOpacity={0.7}
            style={{ borderRadius: 16, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}
          >
            <CalendarClock size={16} color="#2563eb" />
            <Text style={{ fontSize: 12, color: '#0f172a', flex: 1 }}>Upcoming expirations (next 30 days)</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2563eb' }}>View</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 32 }} />
          ) : items.length === 0 ? (
            <View style={{ borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: '#e2e8f0', padding: 32, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
              <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
                {q ? `No leases match this filter.` : "No leases found."}
              </Text>
            </View>
          ) : (
            items.map((l) => {
              const days = getDaysLeft(l.endDate);
              const badgeLabel = l.status === "Active" ? (days <= 30 ? `${days}d left` : "Active") : l.status;
              
              return (
                <TouchableOpacity 
                  key={l.id} 
                  onPress={() => router.push({ pathname: "/(dashboard)/landlord/leases/[id]", params: { id: l.id } } as any)}
                  activeOpacity={0.7}
                  style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                >
                  <View style={{ height: 44, width: 44, borderRadius: 22, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileSignature size={20} color="#2563eb" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14 }} numberOfLines={1}>{l.tenant?.fullName || "Unknown"}</Text>
                    <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }} numberOfLines={1}>{l.propertyName} · {l.roomName}</Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }} numberOfLines={1}>{l.startDate} → {l.endDate}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>{formatVND(l.agreedRent)}</Text>
                    <View style={{ marginTop: 6, backgroundColor: l.status === "Active" ? 'rgba(37,99,235,0.15)' : '#e2e8f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: l.status === "Active" ? '#2563eb' : '#64748b' }}>
                        {badgeLabel}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
