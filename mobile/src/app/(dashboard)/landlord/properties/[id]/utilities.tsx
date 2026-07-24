import React, { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { MobileFrame } from "../../../../../components/MobileFrame";
import { PrimaryButton } from "../../../../../components/ui/PrimaryButton";
import { ArrowLeft, Zap, Droplets, Info, Calendar } from "lucide-react-native";

export default function UtilitiesConfig() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [elec, setElec] = useState("4000");
  const [waterMethod, setWaterMethod] = useState<"metered" | "flat">("metered");
  const [waterMetered, setWaterMetered] = useState("8000");
  const [waterFlat, setWaterFlat] = useState("100000");
  
  const [effective, setEffective] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const formatMoney = (val: string) => {
    if (!val) return "";
    const numeric = val.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  const getRawNumber = (val: string) => val.replace(/,/g, "");

  const handleSave = () => {
    const rawElec = getRawNumber(elec);
    const rawWaterM = getRawNumber(waterMetered);
    const rawWaterF = getRawNumber(waterFlat);
    
    if (Number(rawElec) < 0 || rawElec === "") return setErr("Electricity rate must be a non-negative amount.");
    if (waterMethod === "metered" && (rawWaterM === "" || Number(rawWaterM) < 0)) return setErr("Water rate must be a non-negative amount.");
    if (waterMethod === "flat" && (rawWaterF === "" || Number(rawWaterF) < 0)) return setErr("Flat water amount must be non-negative.");

    setSaving(true);
    setErr(null);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      router.back();
    }, 800);
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEffective(selectedDate);
    }
  };

  return (
    <MobileFrame>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1 bg-background"
      >
        <View className="px-6 pt-14 pb-4 flex-row items-center gap-3">
          <Link href={`/landlord/properties/${id}`} asChild>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View className="flex-1">
            <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">Utilities</Text>
            <Text className="text-2xl font-extrabold leading-tight">Rates</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 mt-2" showsVerticalScrollIndicator={false}>
          
          <View className="rounded-xl border border-[#2563eb]/40 bg-[#2563eb]/10 p-3.5 flex-row gap-2 mb-5">
            <Info size={16} color="#2563eb" className="mt-0.5 shrink-0" />
            <Text className="text-xs text-foreground/80 leading-relaxed pr-4">
              Rate changes apply to new calculations only. Finalized invoices stay untouched.
            </Text>
          </View>

          <View className="space-y-4">
            
            <View className="rounded-2xl border border-border bg-surface p-4 space-y-3">
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 rounded-xl bg-primary/15 items-center justify-center shrink-0">
                  <Zap size={16} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-sm font-semibold">Electricity</Text>
                  <Text className="text-[11px] text-muted-foreground">Price per kWh</Text>
                </View>
              </View>
              <View className="relative justify-center">
                <View className="absolute left-3 z-10">
                  <Text className="text-xs font-bold text-muted-foreground">VNĐ</Text>
                </View>
                <TextInput
                  keyboardType="decimal-pad"
                  value={formatMoney(elec)}
                  onChangeText={setElec}
                  className="w-full h-12 rounded-xl bg-background border border-border pl-12 pr-4 text-sm font-medium"
                />
              </View>
            </View>

            <View className="rounded-2xl border border-border bg-surface p-4 space-y-3">
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 rounded-xl bg-primary/15 items-center justify-center shrink-0">
                  <Droplets size={16} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-sm font-semibold">Water</Text>
                  <Text className="text-[11px] text-muted-foreground">Choose one billing method</Text>
                </View>
              </View>
              
              <View className="flex-row rounded-xl bg-secondary p-1">
                <TouchableOpacity 
                  className={`flex-1 items-center py-2 rounded-lg ${waterMethod === "metered" ? "bg-surface shadow-sm" : ""}`}
                  onPress={() => setWaterMethod("metered")}
                >
                  <Text className={`text-xs font-semibold ${waterMethod === "metered" ? "text-foreground" : "text-muted-foreground"}`}>Metered per m³</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`flex-1 items-center py-2 rounded-lg ${waterMethod === "flat" ? "bg-surface shadow-sm" : ""}`}
                  onPress={() => setWaterMethod("flat")}
                >
                  <Text className={`text-xs font-semibold ${waterMethod === "flat" ? "text-foreground" : "text-muted-foreground"}`}>Flat per tenant</Text>
                </TouchableOpacity>
              </View>

              {waterMethod === "metered" ? (
                <View className="relative justify-center">
                  <View className="absolute left-3 z-10">
                    <Text className="text-xs font-bold text-muted-foreground">VNĐ/m³</Text>
                  </View>
                  <TextInput
                    keyboardType="decimal-pad"
                    value={formatMoney(waterMetered)}
                    onChangeText={setWaterMetered}
                    className="w-full h-12 rounded-xl bg-background border border-border pl-[72px] pr-4 text-sm font-medium"
                  />
                </View>
              ) : (
                <View>
                  <View className="relative justify-center">
                    <View className="absolute left-3 z-10">
                      <Text className="text-xs font-bold text-muted-foreground">VNĐ</Text>
                    </View>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={formatMoney(waterFlat)}
                      onChangeText={setWaterFlat}
                      className="w-full h-12 rounded-xl bg-background border border-border pl-12 pr-4 text-sm font-medium"
                    />
                  </View>
                  <Text className="mt-2 text-[11px] text-muted-foreground">Charged per tenant per month — unlimited usage.</Text>
                </View>
              )}
            </View>

            <View className="mb-4 mt-2">
              <Text className="mb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Effective from</Text>
              {Platform.OS === 'web' ? (
                React.createElement('input', {
                  type: 'date',
                  value: effective.toISOString().slice(0, 10),
                  onChange: (e: any) => setEffective(new Date(e.target.value)),
                  style: {
                    width: '100%',
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: 'var(--surface)',
                    borderWidth: 1,
                    borderColor: 'var(--border)',
                    paddingLeft: 16,
                    paddingRight: 16,
                    fontSize: 14,
                    fontWeight: '500',
                    outline: 'none',
                    color: 'var(--foreground)'
                  }
                })
              ) : (
                <>
                  <TouchableOpacity 
                    onPress={() => setShowPicker(true)}
                    className="w-full h-12 rounded-xl bg-surface border border-border px-4 flex-row items-center justify-between"
                  >
                    <Text className="text-sm font-medium text-foreground">
                      {effective.toISOString().slice(0, 10)}
                    </Text>
                    <Calendar size={18} color="gray" />
                  </TouchableOpacity>
                  
                  {showPicker && (
                    <DateTimePicker
                      value={effective}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                    />
                  )}
                </>
              )}
            </View>
          </View>

          {err && <Text className="text-xs text-destructive mt-2">{err}</Text>}

          <View className="mt-8 mb-8">
            <PrimaryButton onPress={handleSave} disabled={saving}>
              {saving ? "Saving rates..." : "Save rates"}
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileFrame>
  );
}
