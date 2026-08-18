import { MobileFrame } from "@/components/MobileFrame";
import { ContentState } from "@/components/ui/ContentState";
import { Field } from "@/components/ui/Field";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/contexts/auth-context";
import { correctMeterReading, listMeterReadings, type MeterReading } from "@/features/meters/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useI18n } from "@/i18n/I18nProvider";

export default function CorrectMeterReading() {
  const { roomId, readingId } = useLocalSearchParams<{ roomId: string; readingId: string }>(); const { token } = useAuth(); const router = useRouter();
  const { t } = useI18n();
  const [reading, setReading] = useState<MeterReading | null>(null); const [value, setValue] = useState(""); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => { listMeterReadings(token, roomId).then((r) => { const found = r.data.find((x) => x.id === readingId) ?? null; setReading(found); setValue(found ? String(found.value) : ""); if (!found) setError(t('meter.notFound')); }).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [token, roomId, readingId, t]);
  async function save() { const numeric = Number(value); if (!Number.isFinite(numeric) || numeric < (reading?.previousValue ?? 0)) return setError(t('meter.minimumCorrection', { value: reading?.previousValue ?? 0 })); setSaving(true); setError(null); try { await correctMeterReading(token, readingId, numeric); router.back(); } catch (e: any) { setError(e.message); } finally { setSaving(false); } }
  return <MobileFrame><View style={{ flex: 1, backgroundColor: "#f5f8ff" }}><ScreenHeader eyebrow="US-METER-03" title={t('meter.correct')} /><ContentState loading={loading} error={!reading ? error : null} />{reading ? <View style={{ padding: 24 }}><View style={{ backgroundColor: "#fef3c7", padding: 14, borderRadius: 12, marginBottom: 20 }}><Text style={{ color: "#92400e", lineHeight: 20 }}>{t('meter.correctionNotice')}</Text></View><Text style={{ color: "#64748b", marginBottom: 16 }}>{t('meter.previousValue', { utility: reading.utilityType, period: reading.billingPeriod, value: reading.previousValue ?? '—' })}</Text><Field label={t('meter.correctedValue')} value={value} onChangeText={setValue} keyboardType="decimal-pad" />{error ? <Text style={{ color: "#b91c1c", marginBottom: 14 }}>{error}</Text> : null}<PrimaryButton onPress={save} disabled={saving}>{saving ? t('meter.correcting') : t('meter.confirmCorrection')}</PrimaryButton></View> : null}</View></MobileFrame>;
}
