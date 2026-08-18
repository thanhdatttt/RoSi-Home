import React, { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../components/MobileFrame";
import { Field } from "../../../../components/ui/Field";
import { PrimaryButton } from "../../../../components/ui/PrimaryButton";
import { ArrowLeft, Building2, MapPin, Navigation, Zap, Droplets, Plus, X } from "lucide-react-native";
import { useAuth } from "../../../../contexts/auth-context";
import {
  createProperty,
  type CreatePropertyInput,
  type UtilityRatesInput,
} from "../../../../features/portfolio/api";
import { useI18n } from "@/i18n/I18nProvider";

type WaterMethod = "Metered" | "Flat";
type Surcharge = { name: string; amount: string };

const formatMoney = (val: string) => {
  if (!val) return "";
  const numeric = val.replace(/\D/g, "");
  return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const rawNumber = (val: string) => Number(val.replace(/,/g, "")) || 0;

export default function NewProperty() {
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { language, translateLegacy } = useI18n();

  // ── Property basics ──
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");

  // ── Utility rates ──
  const [electricRate, setElectricRate] = useState("");
  const [waterMethod, setWaterMethod] = useState<WaterMethod>("Metered");
  const [waterRate, setWaterRate] = useState("");      // metered: per m³
  const [waterFlat, setWaterFlat] = useState("");      // flat: per tenant

  // ── Surcharges ──
  const [surcharges, setSurcharges] = useState<Surcharge[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSurcharge = () => setSurcharges(prev => [...prev, { name: "", amount: "" }]);
  const removeSurcharge = (i: number) => setSurcharges(prev => prev.filter((_, idx) => idx !== i));
  const updateSurcharge = (i: number, field: keyof Surcharge, value: string) =>
    setSurcharges(prev => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const handleSave = async () => {
    if (!name.trim() || !address.trim()) {
      return setError(translateLegacy("Name and address are required."));
    }
    if (rawNumber(electricRate) <= 0) {
      return setError(translateLegacy("Electricity rate is required."));
    }
    if (waterMethod === "Metered" && rawNumber(waterRate) <= 0) {
      return setError(translateLegacy("Water rate per m³ is required for metered billing."));
    }
    if (waterMethod === "Flat" && rawNumber(waterFlat) <= 0) {
      return setError(translateLegacy("Water flat amount per tenant is required."));
    }

    // Validate surcharges if any
    for (let i = 0; i < surcharges.length; i++) {
      if (!surcharges[i].name.trim()) {
        return setError(language === "vi" ? `Khoản phụ thu #${i + 1} cần có tên.` : `Surcharge #${i + 1} needs a name.`);
      }
      if (rawNumber(surcharges[i].amount) <= 0) {
        return setError(language === "vi" ? `Khoản phụ thu “${surcharges[i].name}” cần có số tiền lớn hơn 0.` : `Surcharge "${surcharges[i].name}" needs an amount > 0.`);
      }
    }

    setError(null);
    setSaving(true);
    try {
      const utilityRates: UtilityRatesInput = {
        electricityRatePerKwh: rawNumber(electricRate),
        waterBillingMethod: waterMethod,
      };
      if (waterMethod === "Metered") {
        utilityRates.waterRatePerM3 = rawNumber(waterRate);
      } else {
        utilityRates.waterFlatAmountPerTenant = rawNumber(waterFlat);
      }

      const body: CreatePropertyInput = {
        name: name.trim(),
        address: address.trim(),
        utilityRates,
      };
      if (locality.trim()) body.locality = locality.trim();
      if (surcharges.length > 0) {
        body.surcharges = surcharges.map(s => ({
          name: s.name.trim(),
          monthlyAmount: rawNumber(s.amount),
        }));
      }

      const property = await createProperty(token, body);
      router.replace(`/landlord/properties/${property.id}`);
    } catch (err: any) {
      setError(err.message || translateLegacy("Failed to create property."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileFrame>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: '#f5f8ff' }}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Math.max(insets.top + 16, 56) }}>
          <Link href="/landlord/properties" asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>New Property</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>Details</Text>
          </View>
        </View>

        {/* Form */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 8 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>

          {/* ─── Section 1: Property Info ─── */}
          <SectionLabel>Property information</SectionLabel>

          <Field
            label="Property name"
            placeholder="e.g. Ridge Villa 2B"
            icon={<Building2 size={16} color="gray" />}
            value={name}
            onChangeText={setName}
          />
          <View style={{ marginTop: 12 }}>
            <Field
              label="Street address"
              placeholder="e.g. 12 Palm Ave"
              icon={<MapPin size={16} color="gray" />}
              value={address}
              onChangeText={setAddress}
            />
          </View>
          <View style={{ marginTop: 12 }}>
            <Field
              label="Locality / Area (optional)"
              placeholder="e.g. East Legon"
              icon={<Navigation size={16} color="gray" />}
              value={locality}
              onChangeText={setLocality}
            />
          </View>

          {/* ─── Section 2: Utility Rates ─── */}
          <View style={{ marginTop: 28 }}>
            <SectionLabel>Default utility rates</SectionLabel>

            <View style={{ borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', padding: 16 }}>
              {/* Electricity */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 8 }}>Electricity</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Zap size={16} color="#f59e0b" />
                  <View style={{ flex: 1 }}>
                    <MoneyInput
                      placeholder="e.g. 3,500"
                      value={formatMoney(electricRate)}
                      onChangeText={setElectricRate}
                    />
                  </View>
                  <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600' }}>VNĐ/kWh</Text>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 16 }} />

              {/* Water method toggle */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 8 }}>Water billing method</Text>
                <View style={{ flexDirection: 'row', borderRadius: 10, backgroundColor: '#f1f5f9', padding: 3 }}>
                  <MethodPill label="Metered" active={waterMethod === "Metered"} onPress={() => setWaterMethod("Metered")} />
                  <MethodPill label="Flat" active={waterMethod === "Flat"} onPress={() => setWaterMethod("Flat")} />
                </View>
              </View>

              {/* Water rate field */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Droplets size={16} color="#3b82f6" />
                <View style={{ flex: 1 }}>
                  <MoneyInput
                    placeholder={waterMethod === "Metered" ? "e.g. 25,000" : "e.g. 100,000"}
                    value={formatMoney(waterMethod === "Metered" ? waterRate : waterFlat)}
                    onChangeText={waterMethod === "Metered" ? setWaterRate : setWaterFlat}
                  />
                </View>
                <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600' }}>
                  {waterMethod === "Metered" ? "VNĐ/m³" : "VNĐ/tenant"}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── Section 3: Surcharges ─── */}
          <View style={{ marginTop: 28 }}>
            <SectionLabel>Surcharges (optional)</SectionLabel>

            {surcharges.map((s, i) => (
              <View
                key={i}
                style={{
                  borderRadius: 14, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0',
                  padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10,
                }}
              >
                <View style={{ flex: 1, gap: 8 }}>
                  <TextInput
                    placeholder="Name (e.g. Garbage)"
                    placeholderTextColor="#94a3b8"
                    value={s.name}
                    onChangeText={v => updateSurcharge(i, "name", v)}
                    style={{ height: 40, borderRadius: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, fontSize: 14, color: '#0f172a' }}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MoneyInput
                      placeholder="Amount"
                      value={formatMoney(s.amount)}
                      onChangeText={v => updateSurcharge(i, "amount", v)}
                    />
                    <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600' }}>VNĐ/mo</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => removeSurcharge(i)}
                  style={{ height: 32, width: 32, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={addSurcharge}
              style={{
                height: 44, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#cbd5e1',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                backgroundColor: '#ffffff',
              }}
            >
              <Plus size={14} color="#64748b" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b' }}>Add surcharge</Text>
            </TouchableOpacity>
          </View>

          {/* ─── Error ─── */}
          {error && (
            <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 12, marginTop: 16 }}>
              <Text style={{ color: '#ef4444', fontSize: 12 }}>{error}</Text>
            </View>
          )}

          {/* ─── Submit ─── */}
          <View style={{ marginTop: 28, marginBottom: 32 }}>
            <PrimaryButton onPress={handleSave} disabled={saving}>
              {saving ? "Creating..." : "Create property"}
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileFrame>
  );
}

/* ─── Small helper components ─── */

function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 14 }}>
      {children}
    </Text>
  );
}

function MethodPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
        backgroundColor: active ? '#ffffff' : 'transparent',
        ...(active ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 } : {}),
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: active ? '700' : '500', color: active ? '#0f172a' : '#94a3b8' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MoneyInput({ placeholder, value, onChangeText }: { placeholder: string; value: string; onChangeText: (v: string) => void }) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      keyboardType="number-pad"
      value={value}
      onChangeText={onChangeText}
      style={{
        height: 40, borderRadius: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
        paddingHorizontal: 12, fontSize: 14, color: '#0f172a', flex: 1,
      }}
    />
  );
}
