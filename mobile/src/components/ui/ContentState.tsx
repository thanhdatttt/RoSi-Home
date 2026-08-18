import { ActivityIndicator, Text, View } from "react-native";
import { useI18n } from "@/i18n/I18nProvider";

export function ContentState({ loading, error, empty, emptyMessage }: { loading?: boolean; error?: string | null; empty?: boolean; emptyMessage?: string }) {
  const { t } = useI18n();
  if (loading) return <View style={{ padding: 32, alignItems: "center" }}><ActivityIndicator color="#2563eb" /></View>;
  if (error) return <View style={{ margin: 24, padding: 16, borderRadius: 12, backgroundColor: "#fee2e2" }}><Text style={{ color: "#b91c1c" }}>{error}</Text></View>;
  if (empty) return <View style={{ padding: 32, alignItems: "center" }}><Text style={{ color: "#64748b", textAlign: "center" }}>{emptyMessage ?? t('common.noData')}</Text></View>;
  return null;
}
