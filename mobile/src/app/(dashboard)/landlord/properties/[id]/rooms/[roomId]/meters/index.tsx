import { MobileFrame } from "@/components/MobileFrame";
import { ContentState } from "@/components/ui/ContentState";
import { Field } from "@/components/ui/Field";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/contexts/auth-context";
import { listMeterReadings, recordMeterReading, type MeterReading, type UtilityType } from "@/features/meters/api";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useI18n } from "@/i18n/I18nProvider";

const currentPeriod = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
export default function MeterReadings() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>(); const { token } = useAuth(); const router = useRouter();
  const { t } = useI18n();
  const [items, setItems] = useState<MeterReading[]>([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const [utilityType, setUtilityType] = useState<UtilityType>("Electricity"); const [billingPeriod, setBillingPeriod] = useState(currentPeriod()); const [value, setValue] = useState(""); const [isInitial, setIsInitial] = useState(false);
  const load = useCallback(() => { setLoading(true); setError(null); listMeterReadings(token, roomId).then((r) => setItems(r.data)).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [token, roomId]);
  useFocusEffect(load);
  async function save() { const numeric = Number(value); if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(billingPeriod)) return setError(t('meter.invalidPeriod')); if (!Number.isFinite(numeric) || numeric < 0) return setError(t('meter.invalidValue')); setSaving(true); setError(null); try { await recordMeterReading(token, roomId, { utilityType, billingPeriod, value: numeric, isInitial }); setValue(""); setIsInitial(false); load(); } catch (e: any) { setError(e.message); } finally { setSaving(false); } }
  return <MobileFrame><View style={{ flex: 1, backgroundColor: "#f5f8ff" }}><ScreenHeader eyebrow={t('meter.roomUtilities')} title={t('meter.readings')} /><ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
    <View style={{ backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 18, padding: 16 }}><Text style={{ fontSize: 17, fontWeight: "800", marginBottom: 14 }}>{t('meter.record')}</Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>{(["Electricity", "Water"] as UtilityType[]).map((type) => <TouchableOpacity key={type} onPress={() => setUtilityType(type)} style={{ flex: 1, alignItems: "center", padding: 10, borderRadius: 10, backgroundColor: utilityType === type ? "#2563eb" : "#e2e8f0" }}><Text style={{ color: utilityType === type ? "white" : "#475569", fontWeight: "700" }}>{t(type === 'Electricity' ? 'status.electricity' : 'status.water')}</Text></TouchableOpacity>)}</View>
      <Field label={t('meter.billingPeriod')} value={billingPeriod} onChangeText={setBillingPeriod} placeholder="YYYY-MM" autoCapitalize="none" />
      <Field label={t('meter.value')} value={value} onChangeText={setValue} placeholder="0" keyboardType="decimal-pad" />
      <TouchableOpacity onPress={() => setIsInitial((v) => !v)} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}><View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: isInitial ? "#2563eb" : "white", borderWidth: 2, borderColor: isInitial ? "#2563eb" : "#94a3b8" }} /><Text style={{ color: "#475569" }}>{t('meter.initialBaseline')}</Text></TouchableOpacity>
      {error ? <Text style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</Text> : null}<PrimaryButton onPress={save} disabled={saving}>{saving ? t('profile.saving') : t('meter.saveReading')}</PrimaryButton>
    </View>
    <Text style={{ fontSize: 17, fontWeight: "800", marginTop: 26, marginBottom: 10 }}>{t('meter.activeHistory')}</Text><ContentState loading={loading} error={items.length ? null : error} empty={!loading && !error && items.length === 0} emptyMessage={t('meter.none')} />
    <View style={{ gap: 10 }}>{items.map((reading) => <TouchableOpacity key={reading.id} disabled={reading.isInitial} onPress={() => router.push({ pathname: "/(dashboard)/landlord/properties/[id]/rooms/[roomId]/meters/[readingId]" as any, params: { id, roomId, readingId: reading.id } })} style={{ backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, padding: 15, opacity: reading.isInitial ? 0.75 : 1 }}><View style={{ flexDirection: "row", justifyContent: "space-between" }}><StatusBadge value={reading.utilityType} /><Text style={{ fontWeight: "700" }}>{reading.billingPeriod}</Text></View><Text style={{ fontSize: 20, fontWeight: "800", marginTop: 9 }}>{reading.value}</Text><Text style={{ color: "#64748b", marginTop: 4 }}>{reading.isInitial ? t('meter.initialBaseline') : t('meter.previousUsage', { previous: reading.previousValue ?? '—', usage: reading.consumption ?? '—' })}</Text>{!reading.isInitial ? <Text style={{ color: "#2563eb", marginTop: 8, fontWeight: "700" }}>{t('meter.correctReading')}</Text> : null}</TouchableOpacity>)}</View>
  </ScrollView></View></MobileFrame>;
}
