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

export default function EditProperty() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
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
        setError("Failed to load property details.");
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id, token]);

  const handleSave = async () => {
    if (!name.trim() || !address.trim()) {
      setError("Name and address are required.");
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
      setError(err.message || "Failed to update property");
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
          <Link href={`/landlord/properties/${id}`} asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Edit Property</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>Details</Text>
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
              {saving ? "Saving..." : "Save changes"}
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileFrame>
  );
}
