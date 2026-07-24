import React, { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { MobileFrame } from "../../../../../../components/MobileFrame";
import { Field } from "../../../../../../components/ui/Field";
import { PrimaryButton } from "../../../../../../components/ui/PrimaryButton";
import { ArrowLeft, DoorOpen, Banknote } from "lucide-react-native";
import { useAuth } from "../../../../../../contexts/auth-context";
import { apiRequest } from "../../../../../../lib/api";

export default function NewRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  
  const [name, setName] = useState("");
  const [rent, setRent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Room name is required.");
      return;
    }
    const rentAmount = parseInt(rent, 10);
    if (isNaN(rentAmount) || rentAmount < 0) {
      setError("Rent must be a valid positive number.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await apiRequest<{ id: string }>(`/rooms/properties/${id}`, {
        method: 'POST',
        token,
        body: { name, baseRent: rentAmount },
      });
      // Go back to property details after creating the room
      router.back();
    } catch (err: any) {
      setError(err.message || "Failed to create room");
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
          <Link href={`/landlord/properties/${id}`} asChild>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View className="flex-1">
            <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">New Room</Text>
            <Text className="text-2xl font-extrabold leading-tight">Details</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
          <View className="space-y-4">
            <Field 
              label="Room / Unit name" 
              placeholder="e.g. Unit #1, Room 104" 
              icon={<DoorOpen size={16} color="gray" />} 
              value={name}
              onChangeText={setName}
            />
            <Field 
              label="Monthly base rent (VNĐ)" 
              placeholder="e.g. 3800000" 
              keyboardType="number-pad"
              icon={<Banknote size={16} color="gray" />} 
              value={rent}
              onChangeText={setRent}
            />
            
            {error && (
              <View className="bg-destructive/10 p-3 rounded-xl mt-2">
                <Text className="text-destructive text-xs">{error}</Text>
              </View>
            )}
          </View>

          <View className="mt-8 mb-8">
            <PrimaryButton onPress={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Create room"}
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileFrame>
  );
}
