import React, { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { MobileFrame } from "../../../../components/MobileFrame";
import { Field } from "../../../../components/ui/Field";
import { PrimaryButton } from "../../../../components/ui/PrimaryButton";
import { ArrowLeft, Building2, MapPin, Navigation } from "lucide-react-native";
import { useAuth } from "../../../../contexts/auth-context";
import { apiRequest } from "../../../../lib/api";

export default function NewProperty() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim() || !address.trim()) {
      setError("Name and address are required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const data = await apiRequest<{ id: string }>('/properties', {
        method: 'POST',
        token,
        body: { name, address, locality: locality || undefined },
      });
      // Navigate to the property detail
      router.replace(`/landlord/properties/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create property");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileFrame>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1 bg-background"
      >
        <View className="px-6 pt-14 pb-4 flex-row items-center gap-3">
          <Link href="/landlord/properties" asChild>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View className="flex-1">
            <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">New Property</Text>
            <Text className="text-2xl font-extrabold leading-tight">Details</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
          <View className="space-y-4">
            <Field 
              label="Property name" 
              placeholder="e.g. Ridge Villa 2B" 
              icon={<Building2 size={16} color="gray" />} 
              value={name}
              onChangeText={setName}
            />
            <Field 
              label="Street address" 
              placeholder="e.g. 12 Palm Ave" 
              icon={<MapPin size={16} color="gray" />} 
              value={address}
              onChangeText={setAddress}
            />
            <Field 
              label="Locality / Area (optional)" 
              placeholder="e.g. East Legon" 
              icon={<Navigation size={16} color="gray" />} 
              value={locality}
              onChangeText={setLocality}
            />
            
            {error && (
              <View className="bg-destructive/10 p-3 rounded-xl mt-2">
                <Text className="text-destructive text-xs">{error}</Text>
              </View>
            )}
          </View>

          <View className="mt-8 mb-8">
            <PrimaryButton onPress={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Create property"}
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileFrame>
  );
}
