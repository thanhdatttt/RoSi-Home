import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft, Receipt, Search, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "@/components/MobileFrame";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/i18n/I18nProvider";
const formatVND = (n: number) => {
  return new Intl.NumberFormat("vi-VN").format(n);
};

type InvoiceView = {
  id: string;
  leaseId: string;
  roomId: string;
  billingPeriod: string;
  status: "Draft" | "Sent" | "Paid";
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  tenantName: string;
  propertyName: string;
  roomName: string;
};

const TABS = ["Draft", "Sent", "Paid", "All"] as const;

export default function InvoicesList() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Draft");
  const [q, setQ] = useState("");
  const [invoices, setInvoices] = useState<InvoiceView[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { formatVnd, statusLabel, t, translateLegacy } = useI18n();

  const fetchInvoices = useCallback(async () => {
    if (!token) return;
    try {
      const data = (await apiRequest("/invoices", { token })) as any;
      setInvoices(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [fetchInvoices])
  );

  const isOverdue = (i: InvoiceView) => {
    if (i.status === "Paid") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = i.dueDate.split('-');
    const due = new Date(Number(y), Number(m) - 1, Number(d));
    return today.getTime() > due.getTime();
  };

  const items = invoices
    .filter((i) => (tab === "All" ? true : i.status === tab))
    .filter((i) => {
      const searchStr = `${i.tenantName} ${i.propertyName} ${i.roomName} ${i.id}`.toLowerCase();
      return searchStr.includes(q.toLowerCase());
    });

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push("/(dashboard)/landlord" as any)}
              style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}
            >
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>{translateLegacy('Billing')}</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a' }}>{translateLegacy('Invoices')}</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ position: 'relative' }}>
            <View style={{ position: 'absolute', left: 14, top: 14, zIndex: 10 }}>
              <Search size={16} color="#64748b" />
            </View>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder={translateLegacy('Search invoice, tenant or room')}
              placeholderTextColor="#94a3b8"
              style={{ width: '100%', height: 44, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 40, paddingRight: 16, fontSize: 14, color: '#0f172a' }}
            />
          </View>

          <View style={{ marginTop: 12, flexDirection: 'row', borderRadius: 12, backgroundColor: '#e2e8f0', padding: 4, gap: 4 }}>
            {TABS.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={{ flex: 1, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === t ? '#ffffff' : 'transparent', shadowColor: tab === t ? '#000' : 'transparent', shadowOpacity: tab === t ? 0.05 : 0, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: tab === t ? 1 : 0 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: tab === t ? '#0f172a' : '#64748b' }}>{statusLabel(t)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView
          style={{ flex: 1, paddingHorizontal: 24, marginTop: 16 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32), gap: 8 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchInvoices} />}
        >
          {loading && items.length === 0 ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 32 }} />
          ) : items.length === 0 ? (
            <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingVertical: 40 }}>{t('invoice.noneInView')}</Text>
          ) : (
            items.map((i) => (
              <TouchableOpacity
                key={i.id}
                onPress={() => router.push({ pathname: "/(dashboard)/landlord/invoices/[id]", params: { id: i.id } } as any)}
                activeOpacity={0.7}
                style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View style={{ height: 44, width: 44, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Receipt size={20} color="#2563eb" />
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }} numberOfLines={1}>{i.tenantName} · {i.roomName}</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }} numberOfLines={1}>{i.billingPeriod} · {i.id}</Text>
                  <Text style={{ fontSize: 11, fontWeight: isOverdue(i) ? '600' : '400', color: isOverdue(i) ? '#ef4444' : '#94a3b8', marginTop: 2 }}>
                    {isOverdue(i) ? t('invoice.dueOverdue', { date: i.dueDate }) : t('invoice.due', { date: i.dueDate })}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>{formatVnd(i.totalAmount)}</Text>
                  <StatusPill status={i.status} />
                </View>

                <ChevronRight size={16} color="#94a3b8" />
              </TouchableOpacity>
            ))
          )}

          <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 16, lineHeight: 16 }}>
            {t('invoice.landlordDraftHint')}
          </Text>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}

function StatusPill({ status }: { status: "Draft" | "Sent" | "Paid" }) {
  const { statusLabel } = useI18n();
  const getStyle = () => {
    switch (status) {
      case "Draft": return { bg: '#e2e8f0', text: '#64748b' };
      case "Sent": return { bg: 'rgba(37,99,235,0.15)', text: '#2563eb' };
      case "Paid": return { bg: '#2563eb', text: '#ffffff' };
    }
  };
  const s = getStyle();

  return (
    <View style={{ marginTop: 4, backgroundColor: s.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: s.text }}>{statusLabel(status)}</Text>
    </View>
  );
}
