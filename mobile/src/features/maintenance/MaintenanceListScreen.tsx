import { ContentState } from "@/components/ui/ContentState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/contexts/auth-context";
import { listMaintenanceRequests, type MaintenanceRequest, type MaintenanceStatus } from "./api";
import { useFocusEffect, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MobileFrame } from "@/components/MobileFrame";
import { useI18n } from '@/i18n/I18nProvider';

const filters: (MaintenanceStatus | "All")[] = ["All", "Pending", "InProgress", "Completed"];

export function MaintenanceListScreen({ tenant }: { tenant: boolean }) {
  const { token } = useAuth(); const router = useRouter();
  const { formatDate, roleLabel, statusLabel, t } = useI18n();
  const [status, setStatus] = useState<MaintenanceStatus | "All">("All");
  const [items, setItems] = useState<MaintenanceRequest[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useFocusEffect(useCallback(() => { let active = true; setLoading(true); setError(null); listMaintenanceRequests(token, status === "All" ? {} : { status }).then((r) => active && setItems(r.data)).catch((e) => active && setError(e.message)).finally(() => active && setLoading(false)); return () => { active = false; }; }, [token, status]));
  const base = tenant ? "/(dashboard)/tenant/maintenance" : "/(dashboard)/landlord/maintenance";
  return <MobileFrame><View style={{ flex: 1, backgroundColor: "#f5f8ff" }}>
    <ScreenHeader eyebrow={roleLabel(tenant ? 'Tenant' : 'Landlord')} title={t('maintenance.title')} />
    <View style={{ paddingHorizontal: 24, flexDirection: "row", gap: 8 }}>
      {filters.map((f) => <TouchableOpacity key={f} onPress={() => setStatus(f)} style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: status === f ? "#2563eb" : "#e2e8f0" }}><Text style={{ color: status === f ? "white" : "#475569", fontSize: 11, fontWeight: "700" }}>{statusLabel(f)}</Text></TouchableOpacity>)}
    </View>
    <ContentState loading={loading} error={error} empty={!loading && !error && items.length === 0} emptyMessage={t('maintenance.noMatches')} />
    {!loading && !error ? <ScrollView contentContainerStyle={{ padding: 24, gap: 12, paddingBottom: 100 }}>
      {items.map((item) => <TouchableOpacity key={item.id} onPress={() => router.push({ pathname: `${base}/[id]` as any, params: { id: item.id } })} style={{ backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0", padding: 16, borderRadius: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}><Text style={{ flex: 1, fontSize: 16, fontWeight: "700", color: "#0f172a" }}>{item.title}</Text><StatusBadge value={item.status} /></View>
        <Text style={{ color: "#64748b", marginTop: 8 }}>{item.room.name} · {formatDate(item.submittedAt)}</Text>
      </TouchableOpacity>)}
    </ScrollView> : null}
    {tenant ? <TouchableOpacity accessibilityLabel={t('maintenance.newRequest')} onPress={() => router.push(`${base}/new` as any)} style={{ position: "absolute", right: 24, bottom: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" }}><Plus color="white" /></TouchableOpacity> : null}
  </View></MobileFrame>;
}
