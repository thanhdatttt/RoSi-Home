import { MobileFrame } from "@/components/MobileFrame";
import { ContentState } from "@/components/ui/ContentState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/contexts/auth-context";
import { listRoomMaintenanceHistory, type RoomMaintenanceHistoryItem } from "@/features/maintenance/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function RoomMaintenanceHistory() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>(); const { token } = useAuth(); const router = useRouter();
  const [items, setItems] = useState<RoomMaintenanceHistoryItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { listRoomMaintenanceHistory(token, roomId).then((r) => setItems(r.data)).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [token, roomId]);
  return <MobileFrame><View style={{ flex: 1, backgroundColor: "#f5f8ff" }}><ScreenHeader eyebrow="Room history" title="Maintenance" /><ContentState loading={loading} error={error} empty={!loading && !error && items.length === 0} emptyMessage="No maintenance history for this room." />
  {!loading && !error ? <ScrollView contentContainerStyle={{ padding: 24, gap: 12, paddingBottom: 40 }}>{items.map((item) => <TouchableOpacity key={item.id} onPress={() => router.push({ pathname: "/(dashboard)/landlord/maintenance/[id]", params: { id: item.id } } as any)} style={{ padding: 16, backgroundColor: "white", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0" }}><View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}><Text style={{ fontSize: 16, fontWeight: "700", flex: 1 }}>{item.title}</Text><StatusBadge value={item.status} /></View><Text style={{ marginTop: 8, color: "#64748b" }}>Requested by {item.requester.fullName}</Text><Text style={{ marginTop: 4, color: "#94a3b8" }}>{item.statusHistory.length} status change(s)</Text></TouchableOpacity>)}</ScrollView> : null}</View></MobileFrame>;
}
