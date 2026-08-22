import { Text, View } from "react-native";
import { useI18n } from "@/i18n/I18nProvider";

const colors: Record<string, { bg: string; fg: string }> = {
  Pending: { bg: "#fef3c7", fg: "#92400e" },
  InProgress: { bg: "#dbeafe", fg: "#1d4ed8" },
  Completed: { bg: "#dcfce7", fg: "#166534" },
  Electricity: { bg: "#fef3c7", fg: "#92400e" },
  Water: { bg: "#dbeafe", fg: "#1d4ed8" },
};

export function StatusBadge({ value }: { value: string }) {
  const { statusLabel } = useI18n();
  const color = colors[value] ?? { bg: "#e2e8f0", fg: "#334155" };
  return <View style={{ alignSelf: "flex-start", backgroundColor: color.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}><Text style={{ color: color.fg, fontSize: 11, fontWeight: "700" }}>{statusLabel(value)}</Text></View>;
}
