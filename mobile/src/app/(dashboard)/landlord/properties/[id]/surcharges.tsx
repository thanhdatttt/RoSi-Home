import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { MobileFrame } from "../../../../../components/MobileFrame";
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

  const [list, setList] = useState<Surcharge[]>(INITIAL);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", start: new Date(), end: new Date() });
  const [useEnd, setUseEnd] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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

  const onChangeStart = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setForm({ ...form, start: selectedDate });
  };
  
  const onChangeEnd = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setForm({ ...form, end: selectedDate });
  };

  return (
    <MobileFrame>
      <View className="flex-1 flex-col bg-background">
        <View className="px-6 pt-14 pb-4 flex-row items-center gap-3">
          <Link href={`/landlord/properties/${id}`} asChild>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View className="flex-1">
            <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">Property</Text>
            <Text className="text-2xl font-extrabold leading-tight">Surcharges</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setAdding(!adding)}
            className="h-10 w-10 rounded-full bg-[#2563eb] items-center justify-center"
          >
            <Plus size={16} color="white" style={{ transform: [{ rotate: adding ? '45deg' : '0deg' }] }} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 mt-2 pb-8" showsVerticalScrollIndicator={false}>
          
          <View className="rounded-xl border border-[#2563eb]/40 bg-[#2563eb]/10 p-3.5 flex-row gap-2 mb-4">
            <Text className="text-xs text-foreground/80 leading-relaxed pr-4">
              Active surcharges appear as separate line items on every invoice. Deactivation only affects future invoices.
            </Text>
          </View>

          {adding && (
            <View className="rounded-2xl border border-border bg-surface p-4 space-y-3 mb-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">New surcharge</Text>
              
              <TextInput
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="e.g. Internet"
                className="w-full h-11 rounded-lg bg-background border border-border px-3 text-sm font-medium"
              />
              
              <View className="relative justify-center">
                <View className="absolute left-3 z-10">
                  <Text className="text-xs font-bold text-muted-foreground">Amt</Text>
                </View>
                <TextInput
                  keyboardType="decimal-pad"
                  value={formatMoney(form.amount)}
                  onChangeText={(text) => setForm({ ...form, amount: text })}
                  placeholder="500,000"
                  className="w-full h-11 rounded-lg bg-background border border-border pl-12 pr-3 text-sm font-medium"
                />
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1 space-y-1">
                  <Text className="text-[11px] text-muted-foreground">Start</Text>
                  {Platform.OS === 'web' ? (
                    React.createElement('input', {
                      type: 'date',
                      value: form.start.toISOString().slice(0, 10),
                      onChange: (e: any) => setForm({ ...form, start: new Date(e.target.value) }),
                      style: { width: '100%', height: 40, borderRadius: 8, backgroundColor: 'var(--background)', borderWidth: 1, borderColor: 'var(--border)', paddingHorizontal: 8, fontSize: 14, outline: 'none', color: 'var(--foreground)' }
                    })
                  ) : (
                    <>
                      <TouchableOpacity onPress={() => setShowStartPicker(true)} className="w-full h-10 rounded-lg bg-background border border-border px-2 justify-center">
                        <Text className="text-sm">{form.start.toISOString().slice(0, 10)}</Text>
                      </TouchableOpacity>
                      {showStartPicker && <DateTimePicker value={form.start} mode="date" display="default" onChange={onChangeStart} />}
                    </>
                  )}
                </View>
                <View className="flex-1 space-y-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[11px] text-muted-foreground">End (optional)</Text>
                  </View>
                  {!useEnd ? (
                    <TouchableOpacity onPress={() => setUseEnd(true)} className="w-full h-10 rounded-lg bg-background border border-border px-2 justify-center items-center">
                      <Text className="text-xs text-muted-foreground font-medium">+ Add End Date</Text>
                    </TouchableOpacity>
                  ) : (
                    Platform.OS === 'web' ? (
                      React.createElement('input', {
                        type: 'date',
                        value: form.end.toISOString().slice(0, 10),
                        onChange: (e: any) => setForm({ ...form, end: new Date(e.target.value) }),
                        style: { width: '100%', height: 40, borderRadius: 8, backgroundColor: 'var(--background)', borderWidth: 1, borderColor: 'var(--border)', paddingHorizontal: 8, fontSize: 14, outline: 'none', color: 'var(--foreground)' }
                      })
                    ) : (
                      <>
                        <TouchableOpacity onPress={() => setShowEndPicker(true)} className="w-full h-10 rounded-lg bg-background border border-border px-2 justify-center">
                          <Text className="text-sm">{form.end.toISOString().slice(0, 10)}</Text>
                        </TouchableOpacity>
                        {showEndPicker && <DateTimePicker value={form.end} mode="date" display="default" onChange={onChangeEnd} />}
                      </>
                    )
                  )}
                </View>
              </View>

              {err && <Text className="text-xs text-destructive mt-1">{err}</Text>}
              
              <View className="mt-2">
                <PrimaryButton onPress={add}>Add surcharge</PrimaryButton>
              </View>
            </View>
          )}

          <View className="space-y-2 mb-8">
            {list.map((s) => (
              <View 
                key={s.id} 
                className={`rounded-2xl border border-border bg-surface p-4 flex-row items-center gap-3 ${s.active ? "" : "opacity-60"}`}
              >
                <View className="h-10 w-10 rounded-xl bg-primary/15 items-center justify-center shrink-0">
                  <Receipt size={20} color="#2563eb" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-sm font-semibold truncate" numberOfLines={1}>{s.name}</Text>
                  <Text className="text-[11px] text-muted-foreground truncate" numberOfLines={1}>
                    {s.start}{s.end ? ` → ${s.end}` : " · ongoing"}
                  </Text>
                </View>
                <View className="items-end gap-2 shrink-0">
                  <Text className="text-sm font-bold">{s.amount.toLocaleString()} VNĐ</Text>
                  <View className="flex-row gap-1">
                    <TouchableOpacity 
                      onPress={() => toggle(s.id)} 
                      className="h-8 w-8 rounded-lg bg-secondary items-center justify-center"
                    >
                      <Power size={14} color={s.active ? "#2563eb" : "gray"} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => remove(s.id)} 
                      className="h-8 w-8 rounded-lg bg-secondary items-center justify-center"
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
