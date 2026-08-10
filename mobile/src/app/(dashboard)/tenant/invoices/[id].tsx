import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Link, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../components/MobileFrame";
import { PrimaryButton } from "../../../../components/ui/PrimaryButton";
import { ArrowLeft, Download, ShieldAlert, Check } from "lucide-react-native";
import { useAuth } from "../../../../contexts/auth-context";
import { apiRequest, API_BASE } from "../../../../lib/api";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";

const formatVND = (n: number) => {
  if (n == null || isNaN(n)) return '0';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function TenantInvoiceDetail() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        if (!token) return;
        try {
          const res = await apiRequest<any>(`/invoices/${id}`, { token });
          setInvoice(res);
        } catch (err) {
          console.error("Failed to load invoice", err);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }, [id, token])
  );

  const handleDownloadPdf = async () => {
    try {
      if (!token || !invoice) return;
      const url = `${API_BASE}/api/v1/invoices/${id}/pdf?token=${token}`;
      await WebBrowser.openBrowserAsync(url);
    } catch (err: any) {
      Alert.alert("Download Error", err.message);
    }
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

  if (!invoice || invoice.status === "Draft") {
    return (
      <MobileFrame>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f8ff', padding: 32 }}>
          <View style={{ height: 56, width: 56, borderRadius: 16, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={24} color="#ef4444" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a', marginTop: 16 }}>403 · Not available</Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
            This invoice isn't linked to your account, or it hasn't been sent yet.
          </Text>
          <Link href={"/(dashboard)/tenant/invoices" as any} asChild>
            <TouchableOpacity style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#2563eb' }}>Back to my invoices</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </MobileFrame>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = invoice.status === 'Sent' && invoice.dueDate < todayStr;
  const isPaid = invoice.status === 'Paid';

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 96) }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 24, overflow: 'hidden' }}>
            <LinearGradient 
              colors={["#1e3a8a", "#0f172a"]} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Link href={"/(dashboard)/tenant/invoices" as any} asChild>
                <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowLeft size={16} color="#ffffff" />
                </TouchableOpacity>
              </Link>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }} numberOfLines={1}>{invoice.id}</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#ffffff' }} numberOfLines={1}>{invoice.billingPeriod}</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: isPaid ? '#10b981' : 'rgba(255,255,255,0.2)' }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#ffffff' }}>{invoice.status}</Text>
              </View>
            </View>

            <View style={{ marginTop: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Amount due</Text>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#ffffff', marginTop: 4 }}>{formatVND(invoice.totalAmount)}</Text>
              <Text style={{ fontSize: 12, marginTop: 4, color: overdue ? '#fca5a5' : 'rgba(255,255,255,0.7)' }}>
                Due {invoice.dueDate}{overdue ? " · overdue" : ""}
              </Text>
            </View>
          </View>

          {toast && (
            <View style={{ marginHorizontal: 24, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.2)', backgroundColor: 'rgba(37,99,235,0.05)', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Check size={16} color="#2563eb" />
              <Text style={{ fontSize: 12, color: '#0f172a' }}>{toast}</Text>
            </View>
          )}

          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', marginBottom: 8 }}>What you're charged</Text>
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden' }}>
              {invoice.lineItems?.map((it: any, index: number) => (
                <View key={it.id || index} style={{ padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: '#f1f5f9' }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }} numberOfLines={1}>{it.description || it.type}</Text>
                    {it.quantity != null && <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }} numberOfLines={1}>{it.quantity} x {formatVND(it.unitRate)}</Text>}
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{formatVND(it.amount)}</Text>
                </View>
              ))}
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#0f172a' }}>Total</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a' }}>{formatVND(invoice.totalAmount)}</Text>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, marginTop: 24, gap: 12 }}>
            {!isPaid && <PrimaryButton onPress={() => {}}>Pay now</PrimaryButton>}
            <TouchableOpacity onPress={handleDownloadPdf} style={{ height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Download size={16} color="#0f172a" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>Download PDF</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
