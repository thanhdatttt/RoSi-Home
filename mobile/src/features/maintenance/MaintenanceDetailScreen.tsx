import { ContentState } from "@/components/ui/ContentState";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MobileFrame } from "@/components/MobileFrame";
import { useAuth } from "@/contexts/auth-context";
import { getMaintenanceRequest, updateMaintenanceStatus, type MaintenanceRequest, type MaintenanceStatus } from "./api";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useI18n } from '@/i18n/I18nProvider';

const next: Partial<Record<MaintenanceStatus, MaintenanceStatus>> = { Pending: "InProgress", InProgress: "Completed" };
export function MaintenanceDetailScreen({ tenant }: { tenant: boolean }) {
  const { id } = useLocalSearchParams<{ id: string }>(); const { token } = useAuth();
  const { formatDate, t } = useI18n();
  const [item, setItem] = useState<MaintenanceRequest | null>(null); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => { setLoading(true); getMaintenanceRequest(token, id).then(setItem).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [id, token]);
  useFocusEffect(load);
  async function advance() { if (!item || !next[item.status]) return; setSaving(true); setError(null); try { await updateMaintenanceStatus(token, item.id, next[item.status]!); load(); } catch (e: any) { setError(e.message); } finally { setSaving(false); } }
  return <MobileFrame><View style={{ flex: 1, backgroundColor: "#f5f8ff" }}><ScreenHeader eyebrow={t('maintenance.eyebrow')} title={t('maintenance.details')} /><ContentState loading={loading} error={!item ? error : null} />
    {item ? <ScrollView contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 40 }}>
      <View style={{ backgroundColor: "white", padding: 18, borderRadius: 18, borderWidth: 1, borderColor: "#e2e8f0", gap: 12 }}><StatusBadge value={item.status} /><Text style={{ fontSize: 22, fontWeight: "800", color: "#0f172a" }}>{item.title}</Text><Text style={{ color: "#475569", lineHeight: 21 }}>{item.description}</Text><Text style={{ color: "#64748b" }}>{t('maintenance.room', { name: item.room.name })}</Text>{"property" in item ? <><Text style={{ color: "#64748b" }}>{t('maintenance.property', { name: item.property.name })}</Text><Text style={{ color: "#64748b" }}>{t('maintenance.tenant', { name: item.tenant.fullName })}</Text></> : null}<Text style={{ color: "#94a3b8" }}>{t('maintenance.submitted', { date: formatDate(item.submittedAt) })}</Text></View>
      {item.photos.length ? <View><Text style={{ fontWeight: "700", marginBottom: 10 }}>{t('maintenance.photos', { count: item.photos.length })}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{item.photos.map((p) => <Image key={p.id} source={{ uri: p.fileUrl }} style={{ width: 180, height: 140, borderRadius: 14, marginRight: 10 }} contentFit="cover" />)}</ScrollView></View> : null}
      {error ? <Text style={{ color: "#b91c1c" }}>{error}</Text> : null}
      {!tenant && next[item.status] ? <PrimaryButton disabled={saving} onPress={advance}>{saving ? t('maintenance.updating') : next[item.status] === "InProgress" ? t('maintenance.startWork') : t('maintenance.markCompleted')}</PrimaryButton> : null}
    </ScrollView> : null}
  </View></MobileFrame>;
}
