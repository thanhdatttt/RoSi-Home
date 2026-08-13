import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../../components/MobileFrame";
import { DatePicker } from "../../../../../components/ui/DatePicker";
import { PrimaryButton } from "../../../../../components/ui/PrimaryButton";
import { ArrowLeft, Receipt, Plus, Trash2, Edit2, CalendarClock, CheckCircle2 } from "lucide-react-native";
import {
  createPropertySurcharge,
  deletePropertySurcharge,
  listPropertySurcharges,
  updatePropertySurcharge,
  type SurchargeView,
} from "../../../../../features/portfolio/api";
import { useAuth } from "../../../../../contexts/auth-context";

const toLocalISOString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fmtMoney = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const parseDate = (s: string): Date => {
  const [y, m, d] = s.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
};

const fmtDate = (s: string) => {
  const d = parseDate(s);
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export default function SurchargesConfig() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [groups, setGroups] = useState<Awaited<ReturnType<typeof listPropertySurcharges>>['data']>([]);
  const [loading, setLoading] = useState(true);

  const [formMode, setFormMode] = useState<"hidden" | "add" | "edit">("hidden");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", start: new Date(), end: new Date() });
  const [useEnd, setUseEnd] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchSurcharges = useCallback(async () => {
    try {
      if (!token) return;
      const res = await listPropertySurcharges(token, id);
      setGroups(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchSurcharges();
  }, [fetchSurcharges]);

  const formatMoney = (val: string) => {
    if (!val) return "";
    const numeric = val.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const getRawNumber = (val: string) => val.replace(/,/g, "");

  function openAdd(prefill?: { name: string; amount: string }) {
    if (formMode === "add" && !prefill) {
      setFormMode("hidden");
      return;
    }
    setFormMode("add");
    setEditingId(null);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);

    setForm({ name: prefill?.name || "", amount: prefill?.amount || "", start: nextMonth, end: nextMonth });
    setUseEnd(false);
    setErr(null);
  }

  function openEditUpcoming(s: SurchargeView) {
    setFormMode("edit");
    setEditingId(s.id);
    setForm({
      name: s.name,
      amount: s.monthlyAmount.toString(),
      start: parseDate(s.effectiveFrom),
      end: s.effectiveTo ? parseDate(s.effectiveTo) : new Date(),
    });
    setUseEnd(!!s.effectiveTo);
    setErr(null);
  }

  async function handleDelete(surchargeId: string, name: string) {
    Alert.alert(
      "Delete Surcharge",
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePropertySurcharge(token, surchargeId);
              fetchSurcharges();
            } catch (e: any) {
              Alert.alert("Error", e.message || "Failed to delete surcharge.");
            }
          },
        },
      ]
    );
  }

  async function submit() {
    if (!form.name.trim()) return setErr("Name is required.");
    const rawAmt = getRawNumber(form.amount);

    setSubmitting(true);
    setErr(null);
    try {
      const startStr = toLocalISOString(form.start);
      const endStr = useEnd ? toLocalISOString(form.end) : null;

      if (useEnd && startStr > endStr!) {
        setSubmitting(false);
        return setErr("End date cannot be before start date.");
      }
      if (rawAmt === "" || Number(rawAmt) < 0) {
        setSubmitting(false);
        return setErr("Amount must be non-negative.");
      }

      if (formMode === "edit" && editingId) {
        const payload = {
          name: form.name,
          monthlyAmount: Number(rawAmt),
          effectiveFrom: startStr,
          effectiveTo: endStr,
        };
        await updatePropertySurcharge(token, editingId, payload);
      } else {
        const body = {
          name: form.name.trim(),
          monthlyAmount: Number(rawAmt),
          effectiveFrom: startStr,
          effectiveTo: endStr,
        };
        await createPropertySurcharge(token, id, body);
      }

      setFormMode("hidden");
      setEditingId(null);
      fetchSurcharges();
    } catch (e: any) {
      setErr(e.message || "Failed to save surcharge.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Math.max(insets.top + 16, 56) }}>
          <Link href={`/landlord/properties/${id}`} asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Property</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>Surcharges</Text>
          </View>
          <TouchableOpacity
            onPress={() => openAdd()}
            style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={16} color="white" style={{ transform: [{ rotate: formMode === 'add' ? '45deg' : '0deg' }] }} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 8 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>

          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 14, flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)', lineHeight: 18, flex: 1, paddingRight: 8 }}>
              Surcharges take effect on the 1st of each month. Changes to an active surcharge are scheduled for a future month; only upcoming schedules can be edited.
            </Text>
          </View>

          {formMode !== "hidden" && (
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' }}>
                {formMode === "edit" ? "Edit surcharge" : "New surcharge"}
              </Text>

              <TextInput
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="e.g. Internet"
                style={{ width: '100%', height: 44, borderRadius: 8, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, fontSize: 14, fontWeight: '500', marginTop: 12, color: '#0f172a' }}
              />

              <View style={{ position: 'relative', justifyContent: 'center', marginTop: 12 }}>
                <View style={{ position: 'absolute', left: 12, zIndex: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8' }}>Amt</Text>
                </View>
                <TextInput
                  keyboardType="decimal-pad"
                  value={formatMoney(form.amount)}
                  onChangeText={(text) => setForm({ ...form, amount: text })}
                  placeholder="500,000"
                  style={{ width: '100%', height: 44, borderRadius: 8, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 48, paddingRight: 12, fontSize: 14, fontWeight: '500' }}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <DatePicker
                    label="Applies from"
                    value={form.start}
                    onChange={(d) => setForm({ ...form, start: d })}
                    compact
                    monthOnly
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 11, color: '#94a3b8' }}>End (optional)</Text>
                  </View>
                  {!useEnd ? (
                    <TouchableOpacity onPress={() => setUseEnd(true)} style={{ width: '100%', height: 40, borderRadius: 8, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '500' }}>+ Add End Date</Text>
                    </TouchableOpacity>
                  ) : (
                    <DatePicker
                      value={form.end}
                      onChange={(d) => setForm({ ...form, end: d })}
                      compact
                      monthOnly
                    />
                  )}
                </View>
              </View>

              <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                Rate changes strictly take effect on the 1st of the selected month.
              </Text>

              {err && <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{err}</Text>}

              <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => { setFormMode("hidden"); setEditingId(null); }}
                  style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569' }}>Cancel</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <PrimaryButton onPress={submit} disabled={submitting}>
                    {submitting ? "Saving..." : (formMode === "edit" ? "Save changes" : "Add surcharge")}
                  </PrimaryButton>
                </View>
              </View>
            </View>
          )}

          {/* Surcharge list */}
          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator color="#2563eb" />
            </View>
          ) : groups.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8', fontSize: 14 }}>No surcharges configured.</Text>
            </View>
          ) : (
            <View style={{ gap: 12, marginBottom: 32 }}>
              {groups.map((g) => (
                <View key={g.name} style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                  {/* Current (active) rate */}
                  {g.current && (
                    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Receipt size={20} color="#2563eb" />
                      </View>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{g.name}</Text>
                          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.15)' }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: '#059669' }}>Active</Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }} numberOfLines={1}>
                          {fmtDate(g.current.effectiveFrom)} - {g.current.effectiveTo ? fmtDate(g.current.effectiveTo) : "ongoing"}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700' }}>{fmtMoney(g.current.monthlyAmount)} VNĐ</Text>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          <TouchableOpacity
                            onPress={() => openAdd({ name: g.current!.name, amount: g.current!.monthlyAmount.toString() })}
                            style={{ height: 28, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#475569' }}>Schedule change</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(g.current!.id, g.name)}
                            style={{ height: 28, width: 28, borderRadius: 8, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={12} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Upcoming (scheduled) rate */}
                  {g.upcoming && (
                    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: g.current ? 1 : 0, borderTopColor: '#f1f5f9' }}>
                      <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: 'rgba(59,130,246,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CalendarClock size={20} color="#3b82f6" />
                      </View>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{g.current ? "Scheduled" : g.name}</Text>
                          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: '#f1f5f9' }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>Pending</Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }} numberOfLines={1}>
                          {fmtDate(g.upcoming.effectiveFrom)}{g.upcoming.effectiveTo ? ` - ${fmtDate(g.upcoming.effectiveTo)}` : " - ongoing"}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700' }}>{fmtMoney(g.upcoming.monthlyAmount)} VNĐ</Text>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          <TouchableOpacity
                            onPress={() => openEditUpcoming(g.upcoming!)}
                            style={{ height: 28, width: 28, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Edit2 size={12} color="#475569" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(g.upcoming!.id, g.name)}
                            style={{ height: 28, width: 28, borderRadius: 8, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={12} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
