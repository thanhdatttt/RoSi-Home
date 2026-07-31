import React, { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../../components/MobileFrame";
import { DatePicker } from "../../../../../components/ui/DatePicker";
import { PrimaryButton } from "../../../../../components/ui/PrimaryButton";
import { ArrowLeft, Zap, Droplets, Info } from "lucide-react-native";

export default function UtilitiesConfig() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [elec, setElec] = useState("4000");
  const [waterMethod, setWaterMethod] = useState<"metered" | "flat">("metered");
  const [waterMetered, setWaterMetered] = useState("8000");
  const [waterFlat, setWaterFlat] = useState("100000");
  
  const [effective, setEffective] = useState(new Date());
  
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


  const isMetered = waterMethod === "metered";

  return (
    <MobileFrame>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1, backgroundColor: '#f5f8ff' }}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Link href={`/landlord/properties/${id}`} asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Utilities</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>Rates</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 8 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          
          {/* Info banner */}
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 14, flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            <Info size={16} color="#2563eb" />
            <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)', lineHeight: 18, flex: 1, paddingRight: 8 }}>
              Rate changes apply to new calculations only. Finalized invoices stay untouched.
            </Text>
          </View>

          {/* Electricity card */}
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="#2563eb" />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>Electricity</Text>
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>Price per kWh</Text>
              </View>
            </View>
            <View style={{ marginTop: 12, position: 'relative', justifyContent: 'center' }}>
              <View style={{ position: 'absolute', left: 12, zIndex: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8' }}>VNĐ</Text>
              </View>
              <TextInput
                keyboardType="decimal-pad"
                value={formatMoney(elec)}
                onChangeText={setElec}
                style={{ width: '100%', height: 48, borderRadius: 12, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 48, paddingRight: 16, fontSize: 14, fontWeight: '500' }}
              />
            </View>
          </View>

          {/* Water card */}
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Droplets size={16} color="#2563eb" />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>Water</Text>
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>Choose one billing method</Text>
              </View>
            </View>
            
            {/* Toggle - using style props only, no dynamic classNames */}
            <View style={{ marginTop: 16, flexDirection: 'row', borderRadius: 12, backgroundColor: '#f1f5f9', padding: 4 }}>
              <TouchableOpacity 
                style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, backgroundColor: isMetered ? '#ffffff' : 'transparent', ...(isMetered ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : {}) }}
                onPress={() => setWaterMethod("metered")}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: isMetered ? '#0f172a' : '#94a3b8' }}>Metered per m³</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, backgroundColor: !isMetered ? '#ffffff' : 'transparent', ...(!isMetered ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : {}) }}
                onPress={() => setWaterMethod("flat")}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: !isMetered ? '#0f172a' : '#94a3b8' }}>Flat per tenant</Text>
              </TouchableOpacity>
            </View>

            {/* Water input - always render both, use display to toggle */}
            <View style={{ marginTop: 16, display: isMetered ? 'flex' : 'none' }}>
              <View style={{ position: 'relative', justifyContent: 'center' }}>
                <View style={{ position: 'absolute', left: 12, zIndex: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8' }}>VNĐ/m³</Text>
                </View>
                <TextInput
                  keyboardType="decimal-pad"
                  value={formatMoney(waterMetered)}
                  onChangeText={setWaterMetered}
                  style={{ width: '100%', height: 48, borderRadius: 12, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 72, paddingRight: 16, fontSize: 14, fontWeight: '500' }}
                />
              </View>
            </View>
            <View style={{ marginTop: isMetered ? 0 : 16, display: !isMetered ? 'flex' : 'none' }}>
              <View style={{ position: 'relative', justifyContent: 'center' }}>
                <View style={{ position: 'absolute', left: 12, zIndex: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8' }}>VNĐ</Text>
                </View>
                <TextInput
                  keyboardType="decimal-pad"
                  value={formatMoney(waterFlat)}
                  onChangeText={setWaterFlat}
                  style={{ width: '100%', height: 48, borderRadius: 12, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 48, paddingRight: 16, fontSize: 14, fontWeight: '500' }}
                />
              </View>
              <Text style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>Charged per tenant per month — unlimited usage.</Text>
            </View>
          </View>

          {/* Effective date */}
          <View style={{ marginBottom: 16 }}>
            <DatePicker 
              label="Effective from"
              value={effective} 
              onChange={setEffective} 
            />
          </View>

          {err && <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{err}</Text>}

          <View style={{ marginTop: 32, marginBottom: 32 }}>
            <PrimaryButton onPress={handleSave} disabled={saving}>
              {saving ? "Saving rates..." : "Save rates"}
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileFrame>
  );
}

