import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, ActivityIndicator } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../../components/MobileFrame";
import { DatePicker } from "../../../../../components/ui/DatePicker";
import { PrimaryButton } from "../../../../../components/ui/PrimaryButton";
import { ArrowLeft, Receipt, Plus, Trash2, Edit2 } from "lucide-react-native";
import { apiRequest } from "../../../../../lib/api";
import { useAuth } from "../../../../../contexts/auth-context";

const toLocalISOString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

type Surcharge = { id: string; name: string; monthlyAmount: number; effectiveFrom: string; effectiveTo?: string | null };

export default function SurchargesConfig() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [list, setList] = useState<Surcharge[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", start: new Date(), end: new Date() });
  const [useEnd, setUseEnd] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchSurcharges = useCallback(async () => {
    try {
      const data = await apiRequest<any>(`/charges/properties/${id}/surcharges`, { token });
      setList(data.data || data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchSurcharges();
  }, [fetchSurcharges]);

  async function remove(sid: string) {
    try {
      await apiRequest(`/charges/${sid}`, {
        method: "DELETE",
        token,
      });
      fetchSurcharges();
    } catch (e: any) {
      alert("Failed to deactivate surcharge: " + e.message);
    }
  }

  const formatMoney = (val: string) => {
    if (!val) return "";
    const numeric = val.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getRawNumber = (val: string) => val.replace(/,/g, "");

  function openAdd() {
    setAdding(!adding);
    setEditingId(null);
    setForm({ name: "", amount: "", start: new Date(), end: new Date() });
    setUseEnd(false);
    setErr(null);
  }

  function openEdit(s: Surcharge) {
    setAdding(true);
    setEditingId(s.id);
    
    let startD = new Date();
    if (s.effectiveFrom) {
      const [y, m, d] = s.effectiveFrom.split('-');
      if (y && m && d) startD = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    
    let endD = new Date();
    let hasEnd = false;
    if (s.effectiveTo) {
      const [y, m, d] = s.effectiveTo.split('-');
      if (y && m && d) {
        endD = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        hasEnd = true;
      }
    }
    
    setForm({ name: s.name, amount: s.monthlyAmount.toString(), start: startD, end: endD });
    setUseEnd(hasEnd);
    setErr(null);
  }

  async function submit() {
    if (!form.name.trim()) return setErr("Name is required.");
    const rawAmt = getRawNumber(form.amount);
    if (rawAmt === "" || Number(rawAmt) < 0) return setErr("Amount must be non-negative.");
    
    if (!editingId && list.some((s) => s.name.toLowerCase() === form.name.trim().toLowerCase())) {
      return setErr("An active surcharge with this name already exists.");
    }

    setSubmitting(true);
    setErr(null);
    try {
      const body = {
        name: form.name.trim(),
        monthlyAmount: Number(rawAmt),
        effectiveFrom: toLocalISOString(form.start),
        effectiveTo: useEnd ? toLocalISOString(form.end) : null,
      };

      if (editingId) {
        await apiRequest(`/charges/${editingId}`, {
          method: "PATCH",
          token,
          body,
        });
      } else {
        await apiRequest(`/charges/properties/${id}/surcharges`, {
          method: "POST",
          token,
          body,
        });
      }
      
      setForm({ name: "", amount: "", start: new Date(), end: new Date() });
      setUseEnd(false);
      setAdding(false);
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
        {/* Header */}
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
            onPress={openAdd}
            style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={16} color="white" style={{ transform: [{ rotate: adding && !editingId ? '45deg' : '0deg' }] }} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 8 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          
          {/* Info banner */}
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 14, flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)', lineHeight: 18, flex: 1, paddingRight: 8 }}>
              Active surcharges appear as separate line items on every invoice. Deactivation only affects future invoices.
            </Text>
          </View>

          {/* Add/Edit form */}
          {adding && (
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' }}>
                {editingId ? "Edit surcharge" : "New surcharge"}
              </Text>
              
              <TextInput
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="e.g. Internet"
                style={{ width: '100%', height: 44, borderRadius: 8, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, fontSize: 14, fontWeight: '500', marginTop: 12 }}
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

              {/* Date row */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <DatePicker 
                    label="Start"
                    value={form.start}
                    onChange={(d) => setForm({ ...form, start: d })}
                    compact
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
                    />
                  )}
                </View>
              </View>

              {err && <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{err}</Text>}
              
              <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
                {editingId && (
                  <TouchableOpacity 
                    onPress={() => { setAdding(false); setEditingId(null); }}
                    style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569' }}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <View style={{ flex: editingId ? 1 : 0, width: editingId ? 'auto' : '100%' }}>
                  <PrimaryButton onPress={submit} disabled={submitting}>
                    {submitting ? "Saving..." : (editingId ? "Save changes" : "Add surcharge")}
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
          ) : list.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8', fontSize: 14 }}>No surcharges configured.</Text>
            </View>
          ) : (
            <View style={{ gap: 8, marginBottom: 32 }}>
              {list.map((s) => (
                <View 
                  key={s.id} 
                  style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                >
                  <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Receipt size={20} color="#2563eb" />
                  </View>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{s.name}</Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8' }} numberOfLines={1}>
                      {s.effectiveFrom}{s.effectiveTo ? ` → ${s.effectiveTo}` : " · ongoing"}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700' }}>{s.monthlyAmount.toLocaleString()} VNĐ</Text>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      <TouchableOpacity 
                        onPress={() => openEdit(s)} 
                        style={{ height: 32, width: 32, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Edit2 size={14} color="#475569" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => remove(s.id)} 
                        style={{ height: 32, width: 32, borderRadius: 8, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
