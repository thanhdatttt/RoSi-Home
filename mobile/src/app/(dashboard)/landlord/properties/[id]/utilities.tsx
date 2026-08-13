import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../../components/MobileFrame";
import { DatePicker } from "../../../../../components/ui/DatePicker";
import { PrimaryButton } from "../../../../../components/ui/PrimaryButton";
import { ArrowLeft, Zap, Droplets, Info, CalendarClock, CheckCircle2, X, Pencil } from "lucide-react-native";
import { ActivityIndicator } from "react-native";
import { useAuth } from "../../../../../contexts/auth-context";
import {
  cancelPropertyUtilityRate,
  getPropertyUtilityRates,
  schedulePropertyUtilityRate,
  type ScheduleUtilityRateInput,
  type UtilityRateView,
} from "../../../../../features/portfolio/api";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

type Schedule = {
  id: string;
  elec: string;
  waterMethod: "metered" | "flat";
  waterMetered: string;
  waterFlat: string;
  effectiveMonth: Date; // e.g. 2026-07-01
};

const thisMonth1st = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const toLocalISOString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseDate = (s: string): Date => {
  const [y, m, d] = s.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
};

const fmtMonth = (d: Date) => {
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

function mapRate(r: UtilityRateView): Schedule {
  return {
    id: r.id,
    elec: r.electricityRatePerKwh.toString(),
    waterMethod: r.waterBillingMethod.toLowerCase() as "metered" | "flat",
    waterMetered: r.waterRatePerM3?.toString() ?? "",
    waterFlat: r.waterFlatAmountPerTenant?.toString() ?? "",
    effectiveMonth: parseDate(r.effectiveFrom),
  };
}

const rateSummary = (s: Schedule) =>
  `${Number(s.elec).toLocaleString()} VNĐ/kWh · ${
    s.waterMethod === "metered"
      ? `${Number(s.waterMetered).toLocaleString()} VNĐ/m³`
      : `${Number(s.waterFlat).toLocaleString()} VNĐ flat`
  }`;

export default function UtilitiesConfig() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const { token } = useAuth();

  const [active, setActive] = useState<Schedule | null>(null);
  const [upcoming, setUpcoming] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [saved, setSaved] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        if (!token) {
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const res = await getPropertyUtilityRates(token, id);
          setActive(res.current ? mapRate(res.current) : null);
          setUpcoming(res.upcoming ? mapRate(res.upcoming) : null);
        } catch (err) {
          console.error("Failed to load rates", err);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }, [id, token])
  );

  // Edit Mode State
  const [elec, setElec] = useState("");
  const [waterMethod, setWaterMethod] = useState<"metered" | "flat">("metered");
  const [waterMetered, setWaterMetered] = useState("");
  const [waterFlat, setWaterFlat] = useState("");
  const [month, setMonth] = useState(new Date());
  const [err, setErr] = useState<string | null>(null);

  function openEdit() {
    const initial = upcoming ?? active;
    if (!initial) return;
    setElec(initial.elec);
    setWaterMethod(initial.waterMethod);
    setWaterMetered(initial.waterMetered);
    setWaterFlat(initial.waterFlat);

    if (upcoming) {
      setMonth(upcoming.effectiveMonth);
    } else {
      // Default to next month
      const d = new Date();
      setMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    }
    setMode("edit");
  }

  async function submit() {
    setErr(null);
    if (elec === "" || Number(elec) < 0) return setErr("Electricity rate must be non-negative.");
    if (waterMethod === "metered" && (waterMetered === "" || Number(waterMetered) < 0)) return setErr("Water rate must be non-negative.");
    if (waterMethod === "flat" && (waterFlat === "" || Number(waterFlat) < 0)) return setErr("Flat water amount must be non-negative.");

    const d1st = new Date(month.getFullYear(), month.getMonth(), 1);
    const curr1st = thisMonth1st();

    if (d1st <= curr1st) return setErr("Rate changes must take effect in a future month.");

    const payload: ScheduleUtilityRateInput = {
      electricityRatePerKwh: Number(elec),
      waterBillingMethod: waterMethod === "metered" ? "Metered" : "Flat",
      waterRatePerM3: waterMethod === "metered" ? Number(waterMetered) : null,
      waterFlatAmountPerTenant: waterMethod === "flat" ? Number(waterFlat) : null,
      effectiveFrom: toLocalISOString(d1st),
    };

    try {
      await schedulePropertyUtilityRate(token, id, payload);

      const res = await getPropertyUtilityRates(token, id);
      setActive(res.current ? mapRate(res.current) : null);
      setUpcoming(res.upcoming ? mapRate(res.upcoming) : null);

      setSaved(`Saved. New rates start ${fmtMonth(d1st)}.`);
      setMode("view");
    } catch (error: any) {
      setErr(error.message || "Failed to save rate");
    }
  }

  async function handleCancelUpcoming() {
    if (!upcoming) return;
    Alert.alert(
      "Cancel Scheduled Change",
      "Are you sure you want to cancel the scheduled rate change?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel it",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await cancelPropertyUtilityRate(token, id, upcoming.id);
              const res = await getPropertyUtilityRates(token, id);
              setActive(res.current ? mapRate(res.current) : null);
              setUpcoming(res.upcoming ? mapRate(res.upcoming) : null);
            } catch (error: any) {
              setErr(error.message || "Failed to cancel change");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Math.max(insets.top + 16, 56) }}>
          {mode === "view" ? (
            <Link href={`/landlord/properties/${id}`} asChild>
              <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={16} color="black" />
              </TouchableOpacity>
            </Link>
          ) : (
            <TouchableOpacity onPress={() => setMode("view")} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Utilities</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>
              {mode === "view" ? "Rates" : upcoming ? "Edit schedule" : "New rates"}
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 32 }} />
          ) : mode === "view" && active ? (
            <View style={{ gap: 16 }}>
              {saved && (
                <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.15)', padding: 14, flexDirection: 'row', gap: 8 }}>
                  <CheckCircle2 size={16} color="#2563eb" style={{ marginTop: 2 }} />
                  <Text style={{ flex: 1, fontSize: 13, color: '#1e293b' }}>{saved}</Text>
                  <TouchableOpacity onPress={() => setSaved(null)}>
                    <X size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden' }}>

                <View style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
                  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: '#10b981', marginTop: 6 }} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600' }}>Active now</Text>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.15)' }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: '#059669' }}>In effect</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{rateSummary(active)}</Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Since {fmtMonth(active.effectiveMonth)}</Text>
                  </View>
                </View>

                {upcoming && (
                  <View style={{ padding: 16, flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                    <View style={{ height: 10, width: 10, borderRadius: 5, borderWidth: 2, borderColor: '#3b82f6', marginTop: 6 }} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600' }}>Scheduled</Text>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: '#f1f5f9' }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>Pending</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{rateSummary(upcoming)}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <CalendarClock size={12} color="#94a3b8" />
                        <Text style={{ fontSize: 11, color: '#94a3b8' }}>Starts {fmtMonth(upcoming.effectiveMonth)}</Text>
                      </View>
                      <TouchableOpacity onPress={handleCancelUpcoming} style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#ef4444' }}>Cancel scheduled change</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

              </View>

              <View style={{ borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.1)', padding: 14, flexDirection: 'row', gap: 8 }}>
                <Info size={16} color="#2563eb" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text style={{ flex: 1, fontSize: 12, color: 'rgba(0,0,0,0.7)', lineHeight: 18 }}>
                  Rate changes always start on the 1st of a future month. The current month keeps its rates so invoices in progress stay consistent.
                </Text>
              </View>

              <PrimaryButton onPress={openEdit}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Pencil size={16} color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    {upcoming ? "Edit scheduled change" : "Schedule rate change"}
                  </Text>
                </View>
              </PrimaryButton>

            </View>
          ) : (
            <View style={{ gap: 20 }}>

              <View>
                <DatePicker
                  label="Applies from (Future month)"
                  value={month}
                  onChange={(d) => setMonth(d)}
                  monthOnly
                />
                <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                  Takes effect on 1 {fmtMonth(month)}. Earlier months are closed for billing.
                </Text>
              </View>

              <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <View style={{ height: 36, width: 36, borderRadius: 10, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={16} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '600' }}>Electricity</Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8' }}>Price per kWh</Text>
                  </View>
                </View>
                <View style={{ position: 'relative', justifyContent: 'center' }}>
                  <Text style={{ position: 'absolute', left: 12, zIndex: 10, fontSize: 12, fontWeight: '700', color: '#94a3b8' }}>VNĐ</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    value={elec}
                    onChangeText={setElec}
                    placeholder="4,000"
                    style={{ width: '100%', height: 44, borderRadius: 8, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 44, paddingRight: 12, fontSize: 14, fontWeight: '500' }}
                  />
                </View>
              </View>

              <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <View style={{ height: 36, width: 36, borderRadius: 10, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <Droplets size={16} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '600' }}>Water</Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8' }}>Choose one billing method</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', borderRadius: 12, backgroundColor: '#f1f5f9', padding: 4, marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, backgroundColor: waterMethod === "metered" ? '#ffffff' : 'transparent', ...(waterMethod === "metered" ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : {}) }}
                    onPress={() => setWaterMethod("metered")}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: waterMethod === "metered" ? '#0f172a' : '#64748b' }}>Metered per m³</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, backgroundColor: waterMethod === "flat" ? '#ffffff' : 'transparent', ...(waterMethod === "flat" ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : {}) }}
                    onPress={() => setWaterMethod("flat")}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: waterMethod === "flat" ? '#0f172a' : '#64748b' }}>Flat per tenant</Text>
                  </TouchableOpacity>
                </View>

                {waterMethod === "metered" ? (
                  <View style={{ position: 'relative', justifyContent: 'center' }}>
                    <Text style={{ position: 'absolute', left: 12, zIndex: 10, fontSize: 12, fontWeight: '700', color: '#94a3b8' }}>VNĐ/m³</Text>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={waterMetered}
                      onChangeText={setWaterMetered}
                      placeholder="8,000"
                      style={{ width: '100%', height: 44, borderRadius: 8, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 64, paddingRight: 12, fontSize: 14, fontWeight: '500' }}
                    />
                  </View>
                ) : (
                  <View>
                    <View style={{ position: 'relative', justifyContent: 'center' }}>
                      <Text style={{ position: 'absolute', left: 12, zIndex: 10, fontSize: 12, fontWeight: '700', color: '#94a3b8' }}>VNĐ</Text>
                      <TextInput
                        keyboardType="decimal-pad"
                        value={waterFlat}
                        onChangeText={setWaterFlat}
                        placeholder="100,000"
                        style={{ width: '100%', height: 44, borderRadius: 8, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 44, paddingRight: 12, fontSize: 14, fontWeight: '500' }}
                      />
                    </View>
                    <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Charged per tenant per month — unlimited usage.</Text>
                  </View>
                )}
              </View>

              {err && <Text style={{ fontSize: 12, color: '#ef4444', textAlign: 'center' }}>{err}</Text>}

              <View style={{ gap: 8, marginTop: 8 }}>
                <PrimaryButton onPress={submit}>
                  {`Schedule for ${fmtMonth(month)}`}
                </PrimaryButton>
                <TouchableOpacity
                  onPress={() => setMode("view")}
                  style={{ height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569' }}>Cancel</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
