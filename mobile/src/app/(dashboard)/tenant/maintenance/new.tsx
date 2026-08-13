import { MobileFrame } from "@/components/MobileFrame";
import { Field } from "@/components/ui/Field";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/contexts/auth-context";
import { submitMaintenanceRequest, type MaintenanceAttachment } from "@/features/maintenance/api";
import { apiRequest } from "@/lib/api";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, ImagePlus, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

type TenantDashboard = { roomId: string; roomName: string } | null;
const MAX_BYTES = 5 * 1024 * 1024;

export default function NewMaintenanceRequest() {
  const { token } = useAuth(); const router = useRouter();
  const [dashboard, setDashboard] = useState<TenantDashboard>(null); const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [photos, setPhotos] = useState<MaintenanceAttachment[]>([]); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  useEffect(() => { apiRequest<TenantDashboard>("/dashboard/tenant", { token }).then(setDashboard).catch((e) => setError(e.message)); }, [token]);

  async function addPhoto(camera: boolean) {
    setError(null); if (photos.length >= 3) return setError("A maximum of 3 photos is allowed.");
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return setError(camera ? "Camera permission is required." : "Photo library permission is required.");
    const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8, selectionLimit: 3 - photos.length, allowsMultipleSelection: true });
    if (result.canceled) return;
    const accepted: MaintenanceAttachment[] = [];
    for (const asset of result.assets) {
      const mime = asset.mimeType === "image/png" ? "image/png" : "image/jpeg";
      if (asset.fileSize && asset.fileSize > MAX_BYTES) { setError("Each photo must be 5 MB or smaller."); continue; }
      accepted.push({ uri: asset.uri, name: asset.fileName ?? `maintenance-${Date.now()}-${accepted.length}.${mime === "image/png" ? "png" : "jpg"}`, mimeType: mime, fileSize: asset.fileSize });
    }
    setPhotos((current) => [...current, ...accepted].slice(0, 3));
  }

  async function submit() {
    if (!dashboard?.roomId) return setError("An active room is required to submit a request.");
    if (!title.trim() || !description.trim()) return setError("Title and description are required.");
    setSaving(true); setError(null);
    try { await submitMaintenanceRequest(token, { roomId: dashboard.roomId, title: title.trim(), description: description.trim(), photos }); router.replace("/(dashboard)/tenant/maintenance" as any); }
    catch (e: any) { setError(e.message); } finally { setSaving(false); }
  }

  return <MobileFrame><KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#f5f8ff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScreenHeader eyebrow="Tenant" title="Report a repair" /><ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
    <Text style={{ color: "#64748b", marginBottom: 18 }}>Room: {dashboard?.roomName ?? "No active lease"}</Text>
    <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Leaking kitchen tap" maxLength={160} />
    <Field label="Description" value={description} onChangeText={setDescription} placeholder="Describe the problem and where it is" multiline numberOfLines={5} className="h-32 py-3" textAlignVertical="top" />
    <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>Photos ({photos.length}/3)</Text>
    <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}><TouchableOpacity onPress={() => addPhoto(false)} style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: "#e2e8f0", alignItems: "center", gap: 4 }}><ImagePlus size={20} color="#2563eb" /><Text>Library</Text></TouchableOpacity><TouchableOpacity onPress={() => addPhoto(true)} style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: "#e2e8f0", alignItems: "center", gap: 4 }}><Camera size={20} color="#2563eb" /><Text>Camera</Text></TouchableOpacity></View>
    <ScrollView horizontal style={{ marginTop: 12 }}>{photos.map((photo, index) => <View key={photo.uri} style={{ marginRight: 10 }}><Image source={{ uri: photo.uri }} style={{ width: 100, height: 90, borderRadius: 12 }} /><TouchableOpacity accessibilityLabel="Remove photo" onPress={() => setPhotos((p) => p.filter((_, i) => i !== index))} style={{ position: "absolute", right: 4, top: 4, backgroundColor: "#0f172acc", borderRadius: 12, padding: 3 }}><X size={14} color="white" /></TouchableOpacity></View>)}</ScrollView>
    {error ? <Text style={{ color: "#b91c1c", marginVertical: 14 }}>{error}</Text> : <View style={{ height: 18 }} />}
    <PrimaryButton onPress={submit} disabled={saving || !dashboard?.roomId}>{saving ? "Submitting..." : "Submit request"}</PrimaryButton>
  </ScrollView></KeyboardAvoidingView></MobileFrame>;
}
