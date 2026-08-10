import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../../../components/MobileFrame";
import { Field } from "../../../../../../components/ui/Field";
import { PrimaryButton } from "../../../../../../components/ui/PrimaryButton";
import { ArrowLeft, DoorOpen, Banknote } from "lucide-react-native";
import { useAuth } from "../../../../../../contexts/auth-context";
import { apiRequest } from "../../../../../../lib/api";

export default function EditRoom() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState("");
  const [rent, setRent] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoom() {
      if (!token) return;
      try {
        const data = await apiRequest<any>(`/rooms/${roomId}`, { token });
        setName(data.name || "");
        setRent(data.baseRent != null ? String(data.baseRent) : "");
      } catch (err) {
        console.error("Failed to load room", err);
        setError("Failed to load room details.");
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [roomId, token]);

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
      await apiRequest(`/rooms/${roomId}`, {
        method: 'PATCH',
        token,
        body: { name, baseRent: rentAmount },
      });
      router.back();
    } catch (err: any) {
      setError(err.message || "Failed to update room");
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
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Room Configuration</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>Details</Text>
          </View>
        </View>

        {/* Form */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 16 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          <Field 
            label="Room / Unit name" 
            placeholder="e.g. Unit #1, Room 104" 
            icon={<DoorOpen size={16} color="gray" />} 
            value={name}
            onChangeText={setName}
          />
          <View style={{ marginTop: 16 }}>
            <Field 
              label="Monthly base rent (VNĐ)" 
              placeholder="e.g. 3800000" 
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
              {saving ? "Saving..." : "Save changes"}
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileFrame>
  );
}
