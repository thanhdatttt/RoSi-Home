import { ActivityIndicator, Text, View } from "react-native";

export function ContentState({ loading, error, empty, emptyMessage = "No data yet." }: { loading?: boolean; error?: string | null; empty?: boolean; emptyMessage?: string }) {
  if (loading) return <View style={{ padding: 32, alignItems: "center" }}><ActivityIndicator color="#2563eb" /></View>;
  if (error) return <View style={{ margin: 24, padding: 16, borderRadius: 12, backgroundColor: "#fee2e2" }}><Text style={{ color: "#b91c1c" }}>{error}</Text></View>;
  if (empty) return <View style={{ padding: 32, alignItems: "center" }}><Text style={{ color: "#64748b", textAlign: "center" }}>{emptyMessage}</Text></View>;
  return null;
}
