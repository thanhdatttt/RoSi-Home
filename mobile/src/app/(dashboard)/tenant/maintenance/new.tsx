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
import { useI18n } from '@/i18n/I18nProvider';

type TenantDashboard = { roomId: string; roomName: string } | null;
const MAX_BYTES = 5 * 1024 * 1024;

export default function NewMaintenanceRequest() {
  const { token } = useAuth(); const router = useRouter();
  const { t } = useI18n();
  const [dashboard, setDashboard] = useState<TenantDashboard>(null); const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [photos, setPhotos] = useState<MaintenanceAttachment[]>([]); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  useEffect(() => { apiRequest<TenantDashboard>("/dashboard/tenant", { token }).then(setDashboard).catch((e) => setError(e.message)); }, [token]);

  async function addPhoto(camera: boolean) {
    setError(null); if (photos.length >= 3) return setError(t('maintenance.maxPhotos'));
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return setError(camera ? t('maintenance.cameraPermission') : t('maintenance.libraryPermission'));
    const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8, selectionLimit: 3 - photos.length, allowsMultipleSelection: true });
    if (result.canceled) return;
    const accepted: MaintenanceAttachment[] = [];
    for (const asset of result.assets) {
      const mime = asset.mimeType === "image/png" ? "image/png" : "image/jpeg";
      if (asset.fileSize && asset.fileSize > MAX_BYTES) { setError(t('maintenance.photoSize')); continue; }
      accepted.push({ uri: asset.uri, name: asset.fileName ?? `maintenance-${Date.now()}-${accepted.length}.${mime === "image/png" ? "png" : "jpg"}`, mimeType: mime, fileSize: asset.fileSize });
    }
    setPhotos((current) => [...current, ...accepted].slice(0, 3));
  }

  async function submit() {
    if (!dashboard?.roomId) return setError(t('maintenance.activeRoomRequired'));
    if (!title.trim() || !description.trim()) return setError(t('maintenance.titleDescriptionRequired'));
    setSaving(true); setError(null);
    try { await submitMaintenanceRequest(token, { roomId: dashboard.roomId, title: title.trim(), description: description.trim(), photos }); router.replace("/(dashboard)/tenant/maintenance" as any); }
    catch (e: any) { setError(e.message); } finally { setSaving(false); }
  }

  return <MobileFrame><KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#f5f8ff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScreenHeader eyebrow={t('role.tenant')} title={t('maintenance.reportRepair')} /><ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
    <Text style={{ color: "#64748b", marginBottom: 18 }}>{t('maintenance.room', { name: dashboard?.roomName ?? t('dashboard.noActiveLease') })}</Text>
    <Field label={t('maintenance.titleLabel')} value={title} onChangeText={setTitle} placeholder={t('maintenance.titlePlaceholder')} maxLength={160} />
    <Field label={t('maintenance.descriptionLabel')} value={description} onChangeText={setDescription} placeholder={t('maintenance.descriptionPlaceholder')} multiline numberOfLines={5} className="h-32 py-3" textAlignVertical="top" />
    <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>{t('maintenance.photoCount', { count: photos.length })}</Text>
    <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}><TouchableOpacity onPress={() => addPhoto(false)} style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: "#e2e8f0", alignItems: "center", gap: 4 }}><ImagePlus size={20} color="#2563eb" /><Text>{t('maintenance.library')}</Text></TouchableOpacity><TouchableOpacity onPress={() => addPhoto(true)} style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: "#e2e8f0", alignItems: "center", gap: 4 }}><Camera size={20} color="#2563eb" /><Text>{t('maintenance.camera')}</Text></TouchableOpacity></View>
    <ScrollView horizontal style={{ marginTop: 12 }}>{photos.map((photo, index) => <View key={photo.uri} style={{ marginRight: 10 }}><Image source={{ uri: photo.uri }} style={{ width: 100, height: 90, borderRadius: 12 }} /><TouchableOpacity accessibilityLabel={t('maintenance.removePhoto')} onPress={() => setPhotos((p) => p.filter((_, i) => i !== index))} style={{ position: "absolute", right: 4, top: 4, backgroundColor: "#0f172acc", borderRadius: 12, padding: 3 }}><X size={14} color="white" /></TouchableOpacity></View>)}</ScrollView>
    {error ? <Text style={{ color: "#b91c1c", marginVertical: 14 }}>{error}</Text> : <View style={{ height: 18 }} />}
    <PrimaryButton onPress={submit} disabled={saving || !dashboard?.roomId}>{saving ? t('maintenance.submitting') : t('maintenance.submitRequest')}</PrimaryButton>
  </ScrollView></KeyboardAvoidingView></MobileFrame>;
}
