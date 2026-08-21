import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../../components/MobileFrame";
import { Field } from "../../../../../components/ui/Field";
import { PrimaryButton } from "../../../../../components/ui/PrimaryButton";
import { ArrowLeft, Building2, MapPin, Navigation } from "lucide-react-native";
import { useAuth } from "../../../../../contexts/auth-context";
import { getProperty, updateProperty } from "../../../../../features/portfolio/api";
import { useI18n } from '@/i18n/I18nProvider';

export default function EditProperty() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperty() {
      if (!token) return;
      try {
        const data = await getProperty(token, id);
        setName(data.name || "");
        setAddress(data.address || "");
        setLocality(data.locality || "");
      } catch (err) {
        console.error("Failed to load property", err);
        setError(t('propertyAdmin.loadFailed'));
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id, token]);

  const handleSave = async () => {
    if (!name.trim() || !address.trim()) {
      setError(t('propertyAdmin.nameAddressRequired'));
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateProperty(token, id, {
        name: name.trim(),
        address: address.trim(),
        locality: locality.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      setError(err.message || t('propertyAdmin.updateFailed'));
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
          <TouchableOpacity onPress={() => router.push(`/landlord/properties/${id}`)} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(37,99,235,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={16} color="#2563eb" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>{t('propertyAdmin.edit')}</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>{t('propertyAdmin.details')}</Text>
          </View>
        </View>

        {/* Form */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 16 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          <Field
            label="Property name"
            placeholder="e.g. Ridge Villa 2B"
            icon={<Building2 size={16} color="gray" />}
            value={name}
            onChangeText={setName}
          />
          <View style={{ marginTop: 16 }}>
            <Field
              label="Street address"
              placeholder="e.g. 12 Palm Ave"
              icon={<MapPin size={16} color="gray" />}
              value={address}
              onChangeText={setAddress}
            />
          </View>
          <View style={{ marginTop: 16 }}>
            <Field
              label="Locality / Area (optional)"
              placeholder="e.g. East Legon"
              icon={<Navigation size={16} color="gray" />}
              value={locality}
              onChangeText={setLocality}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileFrame>
  );
}
