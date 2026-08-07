import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { ArrowLeft, Download, Send, Check, Gauge, Calendar, FileSignature } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "@/components/MobileFrame";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { apiRequest, API_BASE } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import * as WebBrowser from "expo-web-browser";
const formatVND = (n: number) => {
  return new Intl.NumberFormat("vi-VN").format(n);
};

type LineItemView = {
  id: string;
  type: string;
  description: string;
  quantity: number | null;
  unitRate: number | null;
  amount: number;
  sourceRateId: string | null;
};

type InvoiceDetailView = {
  id: string;
  leaseId: string;
  roomId: string;
  billingPeriod: string;
  status: "Draft" | "Sent" | "Paid";
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  sentBy: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  tenantName: string;
  propertyName: string;
  roomName: string;
  lineItems: LineItemView[];
};

export default function InvoiceDetail() {
  const { id } = useLocalSearchParams();
  const [invoice, setInvoice] = useState<InvoiceDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  const fetchDetail = useCallback(async () => {
    if (!token) return;
    try {
      const res = (await apiRequest(`/invoices/${id}`, { token })) as any;
      setInvoice(res.data ?? res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  const sendInvoice = async () => {
    if (!token || !invoice || invoice.status !== "Draft") return;
    setSending(true);
    try {
      const res = (await apiRequest(`/invoices/${id}/send`, { method: "POST", token })) as any;
      setInvoice(res.data ?? res);
      setToast("Invoice sent to tenant — a push notification was delivered.");
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const downloadPdf = async () => {
    if (!token || !invoice) return;
    const url = `${API_BASE}/api/v1/invoices/${invoice.id}/pdf?token=${token}`;
    await WebBrowser.openBrowserAsync(url);
  };

  if (loading) {
    return (
      <MobileFrame>
        <View style={{ flex: 1, backgroundColor: '#f5f8ff', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MobileFrame>
    );
  }

  if (!invoice) {
    return (
      <MobileFrame>
        <View style={{ flex: 1, backgroundColor: '#f5f8ff', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#64748b' }}>Invoice not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </MobileFrame>
    );
  }

  const isOverdue = () => {
    if (invoice.status === "Paid") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = invoice.dueDate.split('-');
    const due = new Date(Number(y), Number(m) - 1, Number(d));
    return today.getTime() > due.getTime();
  };

  const getStatusBg = () => {
    if (invoice.status === "Draft") return 'rgba(255,255,255,0.15)';
    if (invoice.status === "Paid") return '#10b981';
    return '#2563eb';
  };

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          
          <View style={{ backgroundColor: '#1e293b', paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity 
                onPress={() => router.push("/(dashboard)/landlord/invoices" as any)}
                style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowLeft size={16} color="white" />
              </TouchableOpacity>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#93c5fd', fontWeight: '600' }} numberOfLines={1}>{invoice.id}</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: 'white' }} numberOfLines={1}>{invoice.billingPeriod}</Text>
              </View>
              <View style={{ backgroundColor: getStatusBg(), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: 'white' }}>{invoice.status}</Text>
              </View>
            </View>
            
            <Text style={{ marginTop: 16, fontSize: 14, color: 'rgba(255,255,255,0.8)' }} numberOfLines={1}>
              {invoice.tenantName} · {invoice.propertyName} · {invoice.roomName}
            </Text>
            
            <View style={{ marginTop: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16 }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Total amount</Text>
              <Text style={{ fontSize: 32, fontWeight: '800', color: 'white', marginTop: 4 }}>{formatVND(invoice.totalAmount)}</Text>
              <Text style={{ fontSize: 12, color: isOverdue() ? '#fca5a5' : 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                Issued {invoice.issueDate} · due {invoice.dueDate}
              </Text>
            </View>
          </View>

          {toast && (
            <View style={{ marginHorizontal: 24, marginTop: 16, borderRadius: 12, backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Check size={16} color="#16a34a" />
              <Text style={{ fontSize: 12, color: '#166534', flex: 1 }}>{toast}</Text>
            </View>
          )}

          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', marginBottom: 8 }}>Itemized breakdown</Text>
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden' }}>
              {invoice.lineItems.map((it, idx) => (
                <View key={it.id} style={{ padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderBottomWidth: idx === invoice.lineItems.length - 1 ? 0 : 1, borderBottomColor: '#f1f5f9' }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{it.type}</Text>
                    {it.description && <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{it.description}</Text>}
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a', flexShrink: 0 }}>{formatVND(it.amount)}</Text>
                </View>
              ))}
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#0f172a' }}>Total</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#2563eb' }}>{formatVND(invoice.totalAmount)}</Text>
              </View>
            </View>
            <Text style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', lineHeight: 16 }}>
              Surcharges are snapshotted from the configuration effective for {invoice.billingPeriod}. Total is rounded to 2 decimals.
            </Text>
          </View>

          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
              <Row icon={<Calendar size={16} color="#2563eb" />} label="Billing period" value={invoice.billingPeriod} />
              <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />
              <Row icon={<FileSignature size={16} color="#2563eb" />} label="Lease" value={invoice.leaseId} />
              {invoice.sentAt && (
                <>
                  <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />
                  <Row icon={<Send size={16} color="#2563eb" />} label="Sent" value={`${new Date(invoice.sentAt).toLocaleDateString()}`} />
                </>
              )}
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, marginTop: 32, gap: 12 }}>
            {invoice.status === "Draft" ? (
              <PrimaryButton 
                variant="primary" 
                onPress={sendInvoice}
                disabled={sending}
              >
                {sending ? <ActivityIndicator color="#ffffff" /> : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Send size={16} color="white" />
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Review & send to tenant</Text>
                  </View>
                )}
              </PrimaryButton>
            ) : (
              <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                Already sent — this invoice can be sent only once.
              </Text>
            )}
            
            <TouchableOpacity
              onPress={downloadPdf}
              style={{ width: '100%', height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
            >
              <Download size={16} color="#0f172a" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>Download PDF</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/(dashboard)/landlord/leases/[id]", params: { id: invoice.leaseId } } as any)}
              style={{ width: '100%', alignItems: 'center', paddingVertical: 12 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#2563eb' }}>Open lease record</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </View>
    </MobileFrame>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ height: 36, width: 36, borderRadius: 10, backgroundColor: 'rgba(37,99,235,0.1)', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a', marginTop: 2 }} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}
