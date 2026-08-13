import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../components/MobileFrame";
import { ArrowLeft, Receipt, ChevronRight, EyeOff } from "lucide-react-native";
import { useAuth } from "../../../../contexts/auth-context";
import { apiRequest } from "../../../../lib/api";

const formatVND = (n: number) => {
  if (n == null || isNaN(n)) return '0';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function TenantInvoices() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        if (!token) return;
        try {
          const res = await apiRequest<any[]>('/tenant-invoices', { token });
          setInvoices(res || []);
        } catch (err) {
          console.error("Failed to load tenant invoices", err);
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
              <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Billing</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a', marginTop: 4 }}>My invoices</Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 24 }}>
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 12, flexDirection: 'row', gap: 8 }}>
              <EyeOff size={16} color="#94a3b8" style={{ marginTop: 2 }} />
              <Text style={{ flex: 1, fontSize: 12, color: '#64748b', lineHeight: 18 }}>
                You only see invoices your landlord has sent. Drafts stay hidden until they're confirmed.
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, marginTop: 16, gap: 12 }}>
            {invoices.length === 0 ? (
              <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingVertical: 32 }}>No invoices found.</Text>
            ) : (
              invoices.map((i) => {
                const todayStr = new Date().toISOString().split('T')[0];
                const overdue = i.status === 'Sent' && i.dueDate < todayStr;
                return (
                  <Link
                    key={i.id}
                    href={{ pathname: "/(dashboard)/tenant/invoices/[id]", params: { id: i.id } } as any}
                    asChild
                  >
                    <TouchableOpacity style={{ borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ height: 44, width: 44, borderRadius: 16, backgroundColor: 'rgba(37,99,235,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Receipt size={20} color="#2563eb" />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }} numberOfLines={1}>{i.billingPeriod}</Text>
                        <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }} numberOfLines={1}>{i.roomName}</Text>
                        <Text style={{ fontSize: 11, marginTop: 4, fontWeight: overdue ? '600' : '400', color: overdue ? '#ef4444' : '#94a3b8' }}>
                          Due {i.dueDate}{overdue ? " · overdue" : ""}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', flexShrink: 0, paddingRight: 4 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>{formatVND(i.totalAmount)}</Text>
                        <View style={{ marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: i.status === 'Paid' ? '#2563eb' : 'rgba(37,99,235,0.1)' }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: i.status === 'Paid' ? '#ffffff' : '#2563eb' }}>{i.status}</Text>
                        </View>
                      </View>
                      <ChevronRight size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  </Link>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
