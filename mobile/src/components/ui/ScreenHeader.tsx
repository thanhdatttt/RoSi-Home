import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ScreenHeader({ title, eyebrow, onBack }: { title: string; eyebrow?: string; onBack?: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: Math.max(insets.top + 12, 48), paddingHorizontal: 24, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack ?? router.back} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" }}>
        <ArrowLeft size={18} color="#0f172a" />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={{ fontSize: 11, color: "#2563eb", fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5 }}>{eyebrow}</Text> : null}
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#0f172a" }}>{title}</Text>
      </View>
    </View>
  );
}
