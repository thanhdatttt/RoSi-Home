import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../../../components/MobileFrame";
import { Field } from "../../../../../../components/ui/Field";
import { PrimaryButton } from "../../../../../../components/ui/PrimaryButton";
import { ArrowLeft, DoorOpen, Banknote, Gauge, Wrench } from "lucide-react-native";
import { useAuth } from "../../../../../../contexts/auth-context";
import { getRoom, updateRoom } from "../../../../../../features/portfolio/api";
import { useI18n } from "@/i18n/I18nProvider";

export default function EditRoom() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [rent, setRent] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoom() {
      if (!token) return;
      try {
        const data = await getRoom(token, roomId);
        setName(data.name || "");
        setRent(data.baseRent != null ? String(data.baseRent) : "");
      } catch (err) {
        console.error("Failed to load room", err);
        setError(t('room.loadFailed'));
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [roomId, t, token]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t('room.nameRequired'));
      return;
    }
    const rentAmount = parseInt(rent, 10);
    if (isNaN(rentAmount) || rentAmount < 0) {
      setError(t('room.invalidRent'));
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateRoom(token, roomId, { name: name.trim(), baseRent: rentAmount });
      router.back();
    } catch (err: any) {
      setError(err.message || t('room.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MobileFrame>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f8ff' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: '#f5f8ff' }}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Math.max(insets.top + 16, 56) }}>
          <TouchableOpacity onPress={() => router.push(`/landlord/properties/${id}`)} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={16} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>{t('room.eyebrow')}</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>{t('room.details')}</Text>
          </View>
        </View>

        {/* Form */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 16 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          <Field
            label={t('room.name')}
            placeholder={t('room.namePlaceholder')}
            icon={<DoorOpen size={16} color="gray" />}
            value={name}
            onChangeText={setName}
          />
          <View style={{ marginTop: 16 }}>
            <Field
              label={t('room.monthlyRent')}
              placeholder={t('room.rentPlaceholder')}
              keyboardType="number-pad"
              icon={<Banknote size={16} color="gray" />}
              value={rent}
              onChangeText={setRent}
            />
          </View>

          {error && (
            <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 12, marginTop: 16 }}>
              <Text style={{ color: '#ef4444', fontSize: 12 }}>{error}</Text>
            </View>
          )}

          <View style={{ marginTop: 32, marginBottom: 32 }}>
            <PrimaryButton onPress={handleSave} disabled={saving}>
              {saving ? t('profile.saving') : t('profile.saveChanges')}
            </PrimaryButton>
          </View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>{t('room.operations')}</Text>
          <TouchableOpacity onPress={() => router.push(`/(dashboard)/landlord/properties/${id}/rooms/${roomId}/meters`)} style={{ borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: 'white', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <Gauge size={20} color="#2563eb" />
            <Text style={{ fontWeight: '700', color: '#0f172a' }}>{t('room.meterReadings')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/(dashboard)/landlord/properties/${id}/rooms/${roomId}/maintenance`)} style={{ borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: 'white', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Wrench size={20} color="#2563eb" />
            <Text style={{ fontWeight: '700', color: '#0f172a' }}>{t('room.maintenanceRequests')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileFrame>
  );
}
