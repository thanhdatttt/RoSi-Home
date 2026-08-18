import { MobileFrame } from "@/components/MobileFrame";
import { ContentState } from "@/components/ui/ContentState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/contexts/auth-context";
import { Storage } from "@/lib/api";
import { disablePushNotifications, enablePushNotifications, listNotifications, PUSH_TOKEN_KEY, type NotificationView } from "./api";
import { openNotificationLink } from "./routing";
import { useFocusEffect, useRouter } from "expo-router";
import { Bell, BellOff, ChevronRight, Smartphone } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useI18n } from '@/i18n/I18nProvider';

export function NotificationCenterScreen() {
  const { token, user } = useAuth(); const router = useRouter();
  const { formatDate, roleLabel, t } = useI18n();
  const [items, setItems] = useState<NotificationView[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [pushEnabled, setPushEnabled] = useState(false); const [changingPush, setChangingPush] = useState(false);
  useEffect(() => { Storage.getItemAsync(PUSH_TOKEN_KEY).then((value) => setPushEnabled(Boolean(value))); }, []);
  const load = useCallback(() => { setLoading(true); setError(null); listNotifications(token).then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [token]);
  useFocusEffect(load);
  async function togglePush() { setChangingPush(true); setError(null); try { if (pushEnabled) { await disablePushNotifications(token); setPushEnabled(false); } else { await enablePushNotifications(token); setPushEnabled(true); } } catch (e: any) { setError(e.message); } finally { setChangingPush(false); } }
  return <MobileFrame><View style={{ flex: 1, backgroundColor: "#f5f8ff" }}><ScreenHeader eyebrow={user?.role ? roleLabel(user.role) : t('notification.eyebrow')} title={t('notification.title')} />
    <View style={{ marginHorizontal: 24, marginBottom: 12, padding: 14, borderRadius: 16, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0", flexDirection: "row", alignItems: "center", gap: 12 }}><View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: pushEnabled ? "#dcfce7" : "#f1f5f9", alignItems: "center", justifyContent: "center" }}><Smartphone size={20} color={pushEnabled ? "#16a34a" : "#64748b"} /></View><View style={{ flex: 1 }}><Text style={{ fontWeight: "700", color: "#0f172a" }}>{t('notification.pushTitle')}</Text><Text style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{pushEnabled ? t('notification.enabledOnDevice') : t('notification.inAppAvailable')}</Text></View><TouchableOpacity disabled={changingPush} onPress={togglePush} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: pushEnabled ? "#fee2e2" : "#2563eb" }}><Text style={{ color: pushEnabled ? "#b91c1c" : "white", fontWeight: "700", fontSize: 12 }}>{changingPush ? "..." : pushEnabled ? t('notification.disable') : t('notification.enable')}</Text></TouchableOpacity></View>
    <ContentState loading={loading} error={error} empty={!loading && !error && items.length === 0} emptyMessage={t('notification.none')} />
    {!loading ? <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, gap: 10 }}>{items.map((item) => { const linked = Boolean(item.linkRef && item.linkRef !== "test:ping"); return <TouchableOpacity key={item.id} disabled={!linked} onPress={() => openNotificationLink(router, user, item.linkRef)} style={{ padding: 16, borderRadius: 16, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0", flexDirection: "row", gap: 12 }}><View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: item.deliveryStatus === "Failed" ? "#fee2e2" : "#dbeafe", alignItems: "center", justifyContent: "center" }}>{item.deliveryStatus === "Failed" ? <BellOff size={18} color="#b91c1c" /> : <Bell size={18} color="#2563eb" />}</View><View style={{ flex: 1 }}><Text style={{ fontWeight: "700", color: "#0f172a" }}>{item.title}</Text><Text style={{ color: "#64748b", marginTop: 4, lineHeight: 19 }}>{item.body}</Text><Text style={{ color: "#94a3b8", fontSize: 11, marginTop: 8 }}>{formatDate(item.createdAt)}</Text></View>{linked ? <ChevronRight size={18} color="#94a3b8" style={{ alignSelf: "center" }} /> : null}</TouchableOpacity>; })}</ScrollView> : null}
  </View></MobileFrame>;
}
