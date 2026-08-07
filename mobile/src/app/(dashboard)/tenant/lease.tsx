import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../components/MobileFrame";
import { ArrowLeft, DoorOpen, Calendar, Wallet, ShieldCheck, CalendarClock } from "lucide-react-native";
import { useAuth } from "../../../contexts/auth-context";
import { apiRequest } from "../../../lib/api";

const formatVND = (n: number) => {
  if (n == null || isNaN(n)) return '0';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function TenantLease() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        if (!token) return;
        try {
          const res = await apiRequest<any>('/dashboard/tenant', { token });
          setData(res);
        } catch (err) {
          console.error("Failed to load tenant lease", err);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }, [token])
  );

  if (loading) {
    return (
      <MobileFrame>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f8ff' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MobileFrame>
    );
  }

  if (!data || !data.leaseId) {
    return (
      <MobileFrame>
        <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
          <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Link href="/(dashboard)/tenant" asChild>
              <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={16} color="#0f172a" />
              </TouchableOpacity>
            </Link>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a' }}>My lease</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, color: '#64748b' }}>No active lease found.</Text>
          </View>
        </View>
      </MobileFrame>
    );
  }

  let days = 0;
  if (data.endDate) {
    const [y, m, d] = data.endDate.split('-');
    const end = new Date(Number(y), Number(m) - 1, Number(d));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    days = Math.max(0, Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  }

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 96) }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Link href="/(dashboard)/tenant" asChild>
              <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={16} color="#0f172a" />
              </TouchableOpacity>
            </Link>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>My tenancy</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a', marginTop: 4 }}>My lease</Text>
            </View>
          </View>

          {/* Alert */}
          <View style={{ paddingHorizontal: 24 }}>
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: 'rgba(37,99,235,0.2)', backgroundColor: 'rgba(37,99,235,0.05)', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <CalendarClock size={20} color="#2563eb" />
              <Text style={{ flex: 1, fontSize: 12, color: '#0f172a', lineHeight: 18 }}>
                Your lease expires on <Text style={{ fontWeight: '700' }}>{data.endDate}</Text> — in {days} days. You'll get a reminder before it ends.
              </Text>
            </View>
          </View>

          {/* Details */}
          <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
            <View style={{ borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden' }}>
              <Row icon={<DoorOpen size={16} color="#2563eb" />} label="Property · Room" value={`${data.propertyName} · ${data.roomName}`} isFirst={true} />
              <Row icon={<Calendar size={16} color="#2563eb" />} label="Lease period" value={`${data.startDate} → ${data.endDate}`} />
              <Row icon={<Wallet size={16} color="#2563eb" />} label="Agreed rent" value={`${formatVND(data.agreedRent)} VNĐ / month`} />
              <Row icon={<Wallet size={16} color="#2563eb" />} label="Deposit" value={`${formatVND(data.deposit)} VNĐ`} />
              <Row icon={<ShieldCheck size={16} color="#2563eb" />} label="Status" value={data.status} />
            </View>
            <Text style={{ marginTop: 12, fontSize: 11, color: '#64748b', lineHeight: 16 }}>
              Lease information is maintained by your landlord. RosiHome stores the record only — it isn't an electronic signature.
            </Text>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}

function Row({ icon, label, value, isFirst }: { icon: React.ReactNode; label: string; value: string; isFirst?: boolean }) {
  return (
    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: isFirst ? 0 : 1, borderTopColor: '#f1f5f9' }}>
      <View style={{ height: 36, width: 36, borderRadius: 8, backgroundColor: 'rgba(37,99,235,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a', marginTop: 2 }} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}
