import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../../components/MobileFrame";
import { DatePicker } from "../../../../../components/ui/DatePicker";
import { PrimaryButton } from "../../../../../components/ui/PrimaryButton";
import { ArrowLeft, Receipt, Plus, Trash2, Power } from "lucide-react-native";

type Surcharge = { id: number; name: string; amount: number; start: string; end?: string; active: boolean };

const INITIAL: Surcharge[] = [
  { id: 1, name: "Internet", amount: 500000, start: "2025-01-01", active: true },
  { id: 2, name: "Security", amount: 200000, start: "2025-01-01", active: true },
  { id: 3, name: "Cleaning (Q1)", amount: 150000, start: "2025-01-01", end: "2025-03-31", active: false },
];

export default function SurchargesConfig() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [list, setList] = useState<Surcharge[]>(INITIAL);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", start: new Date(), end: new Date() });
  const [useEnd, setUseEnd] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  function toggle(sid: number) {
    setList((l) => l.map((s) => (s.id === sid ? { ...s, active: !s.active } : s)));
  }

  function remove(sid: number) {
    setList((l) => l.filter((s) => s.id !== sid));
  }

  const formatMoney = (val: string) => {
    if (!val) return "";
    const numeric = val.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getRawNumber = (val: string) => val.replace(/,/g, "");

  function add() {
    if (!form.name.trim()) return setErr("Name is required.");
    const rawAmt = getRawNumber(form.amount);
    if (rawAmt === "" || Number(rawAmt) < 0) return setErr("Amount must be non-negative.");
    if (list.some((s) => s.active && s.name.toLowerCase() === form.name.trim().toLowerCase())) {
      return setErr("An active surcharge with this name already exists.");
    }

    setList((l) => [
      ...l,
      { 
        id: Date.now(), 
        name: form.name.trim(), 
        amount: Number(rawAmt), 
        start: form.start.toISOString().slice(0, 10), 
        end: useEnd ? form.end.toISOString().slice(0, 10) : undefined, 
        active: true 
      },
    ]);
    
    setForm({ name: "", amount: "", start: new Date(), end: new Date() });
    setUseEnd(false);
    setErr(null);
    setAdding(false);
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
            onPress={() => setAdding(!adding)}
            style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={16} color="white" style={{ transform: [{ rotate: adding ? '45deg' : '0deg' }] }} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 8 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          
          {/* Info banner */}
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 14, flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)', lineHeight: 18, flex: 1, paddingRight: 8 }}>
              Active surcharges appear as separate line items on every invoice. Deactivation only affects future invoices.
            </Text>
          </View>

          {/* Add form */}
          {adding && (
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' }}>New surcharge</Text>
              
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
              
              <View style={{ marginTop: 12 }}>
                <PrimaryButton onPress={add}>Add surcharge</PrimaryButton>
              </View>
            </View>
          )}

          {/* Surcharge list */}
          <View style={{ gap: 8, marginBottom: 32 }}>
            {list.map((s) => (
              <View 
                key={s.id} 
                style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: s.active ? 1 : 0.6 }}
              >
                <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Receipt size={20} color="#2563eb" />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{s.name}</Text>
                  <Text style={{ fontSize: 11, color: '#94a3b8' }} numberOfLines={1}>
                    {s.start}{s.end ? ` → ${s.end}` : " · ongoing"}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700' }}>{s.amount.toLocaleString()} VNĐ</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TouchableOpacity 
                      onPress={() => toggle(s.id)} 
                      style={{ height: 32, width: 32, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Power size={14} color={s.active ? "#2563eb" : "gray"} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => remove(s.id)} 
                      style={{ height: 32, width: 32, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={14} color="gray" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
