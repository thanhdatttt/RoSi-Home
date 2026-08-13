import { MobileFrame } from "@/components/MobileFrame";
import { ContentState } from "@/components/ui/ContentState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/contexts/auth-context";
import { getVietQr, type VietQr } from "./api";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { QrCode, Share2, ShieldCheck } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, Share, Text, TouchableOpacity, View } from "react-native";

const vnd = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} VND`;

export function VietQrScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const [value, setValue] = useState<VietQr | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getVietQr(token, id).then(setValue).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id, token]);

  return <MobileFrame><View style={{ flex: 1, backgroundColor: "#f5f8ff" }}>
    <ScreenHeader eyebrow={user?.role === "Tenant" ? "Payment" : "Payment preview"} title="VietQR" />
    <ContentState loading={loading} error={error} />
    {value ? <ScrollView contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 40 }}>
      <View style={{ padding: 20, borderRadius: 24, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}><QrCode size={20} color="#2563eb" /><Text style={{ fontSize: 12, fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: 1 }}>Scan with a banking app</Text></View>
        <Image source={{ uri: value.imageUrl }} contentFit="contain" accessibilityLabel="VietQR payment code" style={{ width: 280, height: 280, maxWidth: "100%", backgroundColor: "white" }} />
        <Text style={{ color: "#0f172a", fontSize: 28, fontWeight: "900", marginTop: 16 }}>{vnd(value.amount)}</Text>
        <Text style={{ color: "#475569", textAlign: "center", marginTop: 8, lineHeight: 20 }}>{value.description}</Text>
      </View>
      <View style={{ padding: 14, borderRadius: 14, backgroundColor: "#eff6ff", flexDirection: "row", gap: 10 }}><ShieldCheck size={20} color="#2563eb" /><Text style={{ flex: 1, color: "#1e40af", lineHeight: 19 }}>{user?.role === "Tenant" ? "Verify the amount and transfer description in your banking app before confirming." : "This is a preview of the exact QR shown to the assigned tenant."} Generating or scanning this QR does not mark the invoice Paid.</Text></View>
      <TouchableOpacity onPress={() => Share.share({ message: `${value.description}\n${vnd(value.amount)}\n${value.payload}` })} style={{ height: 48, borderRadius: 12, backgroundColor: "#2563eb", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}><Share2 size={17} color="white" /><Text style={{ color: "white", fontWeight: "700" }}>Share transfer details</Text></TouchableOpacity>
      <View style={{ padding: 14, borderRadius: 14, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0" }}><Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase" }}>Encoded payload</Text><Text selectable style={{ color: "#475569", fontSize: 11, lineHeight: 17, marginTop: 7 }}>{value.payload}</Text></View>
    </ScrollView> : null}
  </View></MobileFrame>;
}
