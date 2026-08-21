import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect, useRouter, useLocalSearchParams, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../components/MobileFrame";
import { PrimaryButton } from "../../../../components/ui/PrimaryButton";
import { Field } from "../../../../components/ui/Field";
import { DatePicker } from "../../../../components/ui/DatePicker";
import { ArrowLeft, FileSignature, DoorOpen, Calendar, Wallet, ShieldCheck, Pencil, LogOut, User, Check } from "lucide-react-native";
import { useAuth } from "../../../../contexts/auth-context";
import {
  endLease as endLeaseRequest,
  getLease,
  updateLease,
  type LeaseView,
  type UpdateLeaseInput,
} from "../../../../features/leasing/api";
import { useI18n } from "@/i18n/I18nProvider";

const formatVND = (n: number) => {
  if (n == null || isNaN(n)) return '0';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatMoney = (val: string) => {
  if (!val) return "";
  const numeric = val.replace(/\D/g, "");
  return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const getRawNumber = (val: string) => val.replace(/,/g, "");

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 12 }}>
      <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.7)' }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ height: 36, width: 36, borderRadius: 8, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a', marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
}

export default function LeaseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, formatDate, statusLabel, translateLegacy } = useI18n();

  const [lease, setLease] = useState<LeaseView | null>(null);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<"view" | "edit" | "renew" | "end">("view");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [actualEnd, setActualEnd] = useState(new Date().toISOString().split('T')[0]);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchLease = useCallback(async () => {
    if (!token || !id) return;
    try {
      const data = await getLease(token, id);
      setLease(data);
    } catch (err) {
      console.error(err);
      Alert.alert(translateLegacy("Error"), translateLegacy("Could not load lease."));
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useFocusEffect(
    useCallback(() => {
      fetchLease();
    }, [fetchLease])
  );

  const enterEdit = () => {
    if (!lease) return;
    setEnd(lease.endDate);
    setRent(String(lease.agreedRent));
    setDeposit(String(lease.deposit));
    setMode("edit");
  };

  const enterRenew = () => {
    if (!lease) return;
    const d1 = new Date(lease.startDate);
    const d2 = new Date(lease.endDate);
    const durationMs = d2.getTime() - d1.getTime();
    const newEnd = new Date(d2.getTime() + durationMs);

    setStart(lease.endDate);
    setEnd(newEnd.toISOString().slice(0, 10));
    setRent(String(lease.agreedRent));
    setDeposit(String(lease.deposit));
    setMode("renew");
  };

  const save = async (kind: "edit" | "renew") => {
    if (!token || !lease) return;
    setErr(null);
    setSaving(true);

    try {
      let body: UpdateLeaseInput;
      if (kind === "edit") {
        if (!end) throw new Error(translateLegacy("End date is required."));
        body = { endDate: end, agreedRent: Number(getRawNumber(rent)), deposit: Number(getRawNumber(deposit)) };
      } else {
        if (!start || !end) throw new Error(translateLegacy("Start and end date are required."));
        body = { renewalStartDate: start, renewalEndDate: end, agreedRent: Number(getRawNumber(rent)), deposit: Number(getRawNumber(deposit)) };
      }

      const updated = await updateLease(token, lease.id, body);

      setLease(updated);
      setMode("view");
      setToast(kind === "renew"
        ? (language === "vi" ? "Đã gia hạn hợp đồng. Người thuê hiện có thể xem thời hạn mới." : "Lease renewed. Tenant can now see the updated period.")
        : translateLegacy("Lease updated."));
    } catch (e: any) {
      setErr(e.message || translateLegacy("An error occurred"));
    } finally {
      setSaving(false);
    }
  };

  const endLease = async () => {
    if (!token || !lease) return;
    if (!actualEnd) {
      setErr(translateLegacy("Actual end date is required."));
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const updated = await endLeaseRequest(token, lease.id, actualEnd);
      setLease(updated);
      setMode("view");
      setToast(language === "vi"
        ? `Đã kết thúc hợp đồng. Phòng ${lease.roomName} hiện đang trống.`
        : `Lease ended. ${lease.roomName} is now Vacant.`);
    } catch (e: any) {
      setErr(e.message || translateLegacy("An error occurred"));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !lease) {
    return (
      <MobileFrame>
        <View style={{ flex: 1, backgroundColor: '#f5f8ff', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 96) }}>

          <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 24, backgroundColor: '#1e3a8a', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={16} color="white" />
              </TouchableOpacity>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#60a5fa', fontWeight: '600' }}>{translateLegacy("Lease ")}{lease.id.substring(0,8)}</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: 'white', marginTop: 2 }} numberOfLines={1}>{lease.tenant?.fullName || translateLegacy("Unknown Tenant")}</Text>
              </View>
              <View style={{ backgroundColor: lease.status === "Active" ? '#60a5fa' : 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: lease.status === "Active" ? '#0f172a' : 'white' }}>{statusLabel(lease.status)}</Text>
              </View>
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><Stat label="Agreed rent" value={`${formatVND(lease.agreedRent)} ₫`} /></View>
              <View style={{ flex: 1 }}><Stat label="Deposit" value={`${formatVND(lease.deposit)} ₫`} /></View>
            </View>
          </View>

          {toast && (
            <View style={{ marginHorizontal: 24, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Check size={16} color="#2563eb" />
              <Text style={{ fontSize: 12, color: '#0f172a', flex: 1 }}>{toast}</Text>
            </View>
          )}

          {mode === "view" && (
            <>
              <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
                <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                  <Row icon={<DoorOpen size={16} color="#2563eb" />} label="Property · Room" value={`${lease.propertyName} · ${lease.roomName}`} />
                  <View style={{ height: 1, backgroundColor: '#e2e8f0' }} />
                  <Row icon={<Calendar size={16} color="#2563eb" />} label={translateLegacy("Lease period")} value={`${formatDate(lease.startDate)} → ${formatDate(lease.endDate)}`} />
                  {lease.actualEndDate && (
                    <>
                      <View style={{ height: 1, backgroundColor: '#e2e8f0' }} />
                      <Row icon={<LogOut size={16} color="#2563eb" />} label={translateLegacy("Actual end date")} value={formatDate(lease.actualEndDate)} />
                    </>
                  )}
                  <View style={{ height: 1, backgroundColor: '#e2e8f0' }} />
                  <Row icon={<User size={16} color="#2563eb" />} label={translateLegacy("Tenant contact")} value={lease.tenant?.phone || translateLegacy("N/A")} />
                  <View style={{ height: 1, backgroundColor: '#e2e8f0' }} />
                  <Row icon={<ShieldCheck size={16} color="#2563eb" />} label={translateLegacy("Room status")} value={translateLegacy(lease.status === "Active" ? "Occupied (derived)" : "Vacant (derived)")} />
                  <View style={{ height: 1, backgroundColor: '#e2e8f0' }} />
                  <Row icon={<Wallet size={16} color="#2563eb" />} label={translateLegacy("Last updated")} value={formatDate(lease.updatedAt)} />
                </View>
              </View>

              <View style={{ paddingHorizontal: 24, marginTop: 24, gap: 8 }}>
                <TouchableOpacity onPress={enterEdit} disabled={lease.status !== "Active"} style={{ width: '100%', height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: lease.status !== "Active" ? 0.4 : 1 }}>
                  <Pencil size={16} color="#0f172a" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>Update lease terms</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={enterRenew}
                  disabled={lease.status !== "Active"}
                  style={{ width: '100%', height: 48, borderRadius: 12, backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: lease.status !== "Active" ? 0.4 : 1 }}
                >
                  <FileSignature size={16} color="white" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Record renewal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setMode("end")}
                  disabled={lease.status !== "Active"}
                  style={{ width: '100%', height: 48, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: lease.status !== "Active" ? 0.4 : 1 }}
                >
                  <LogOut size={16} color="#ef4444" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#ef4444' }}>End lease & release room</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {(mode === "edit" || mode === "renew") && (
            <View style={{ paddingHorizontal: 24, marginTop: 20, gap: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' }}>
                {mode === "renew" ? "Renewal period" : "Editable lease terms"}
              </Text>
              {mode === "renew" && (
                <DatePicker label="Start date" value={start ? new Date(start) : new Date()} onChange={(d) => setStart(d.toISOString().slice(0, 10))} />
              )}
              <DatePicker label="End date" value={end ? new Date(end) : new Date()} onChange={(d) => setEnd(d.toISOString().slice(0, 10))} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}><Field label="Agreed rent" icon={<Wallet size={16} color="#64748b" />} value={formatMoney(rent)} onChangeText={setRent} keyboardType="numeric" /></View>
                <View style={{ flex: 1 }}><Field label="Deposit" icon={<Wallet size={16} color="#64748b" />} value={formatMoney(deposit)} onChangeText={setDeposit} keyboardType="numeric" /></View>
              </View>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>{language === "vi" ? `Thời hạn được đối chiếu với các hợp đồng khác của ${lease.roomName}; các khoảng trùng lặp sẽ bị từ chối.` : `Periods are checked against other leases for ${lease.roomName} — overlaps are rejected.`}</Text>

              {err && <Text style={{ fontSize: 12, color: '#ef4444' }}>{err}</Text>}

              <PrimaryButton onPress={() => save(mode)} disabled={saving}>
                {saving ? "Saving..." : (mode === "renew" ? "Save renewal" : "Save changes")}
              </PrimaryButton>
              <TouchableOpacity onPress={() => { setMode("view"); setErr(null); }} style={{ paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#2563eb' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === "end" && (
            <View style={{ paddingHorizontal: 24, marginTop: 20, gap: 12 }}>
              <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.05)', padding: 12 }}>
                <Text style={{ fontSize: 12, color: '#0f172a', lineHeight: 18 }}>
                  Ending this lease records an actual end date and marks it <Text style={{ fontWeight: 'bold' }}>Ended</Text>. Historical invoices, payments, readings and maintenance records are kept. The room becomes <Text style={{ fontWeight: 'bold' }}>Vacant</Text> if no other active lease applies.
                </Text>
              </View>
              <DatePicker label="Actual end date" value={actualEnd ? new Date(actualEnd) : new Date()} onChange={(d) => setActualEnd(d.toISOString().slice(0, 10))} />

              {err && <Text style={{ fontSize: 12, color: '#ef4444' }}>{err}</Text>}

              <TouchableOpacity onPress={endLease} disabled={saving} style={{ height: 48, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' }}>
                {saving ? <ActivityIndicator color="white" /> : <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Confirm end of lease</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode("view")} style={{ paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#2563eb' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </View>
    </MobileFrame>
  );
}
