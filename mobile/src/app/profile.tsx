import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { MobileFrame } from "@/components/MobileFrame";
import { Field } from "@/components/ui/Field";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ArrowLeft, Mail, User, ShieldCheck, KeyRound, LogOut } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/api";

export default function Profile() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!token) return;
      try {
        const data = await apiRequest<any>('/profile', { method: 'GET', token });
        if (data) {
          setName(data.fullName || "");
          setEmail(data.email || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiRequest('/profile', {
        method: 'PATCH',
        token,
        body: { fullName: name }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading) {
    return (
      <MobileFrame>
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <View className="flex-1 flex-col bg-background pb-8">
        <View className="px-6 pt-14 pb-4 flex-row items-center gap-3">
          <Link href={user?.role === 'Tenant' ? "/tenant" : "/landlord"} asChild>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View>
            <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">Account</Text>
            <Text className="text-2xl font-extrabold leading-tight">Your profile</Text>
          </View>
        </View>

        <ScrollView className="flex-1">
          <View className="px-6 flex-col items-center pt-2 pb-6">
            <View className="h-20 w-20 rounded-full bg-[#2563eb] items-center justify-center shadow-sm">
              <Text className="text-white text-2xl font-extrabold">
                {name ? name.substring(0, 2).toUpperCase() : "US"}
              </Text>
            </View>
            <View className="mt-3 flex-row items-center gap-1.5 bg-[#2563eb]/15 px-2.5 py-1 rounded-full">
              <ShieldCheck size={12} color="#2563eb" />
              <Text className="text-[11px] font-semibold text-[#2563eb]">{user?.role || "Landlord"}</Text>
            </View>
          </View>

          <View className="px-6 space-y-4">
            <Field 
              label="Full name" 
              value={name} 
              onChangeText={setName} 
              icon={<User size={16} color="gray" />} 
            />
            <Field 
              label="Email (login identifier)" 
              value={email} 
              readOnly 
              icon={<Mail size={16} color="gray" />} 
              hint="Contact support to change your login email." 
            />
            <View>
              <Text className="text-xs font-medium text-foreground mb-1.5 ml-1">Role</Text>
              <View className="flex-row items-center gap-2 bg-secondary/50 border border-border px-4 h-12 rounded-2xl">
                <ShieldCheck size={16} color="#64748b" />
                <Text className="text-sm font-medium text-foreground">{user?.role || "Landlord"}</Text>
              </View>
            </View>

            {saved && (
              <View className="rounded-lg bg-[#2563eb]/15 border border-[#2563eb]/30 px-3 py-2 mt-2">
                <Text className="text-xs text-[#2563eb]">Profile updated.</Text>
              </View>
            )}

            <View className="pt-2">
              <PrimaryButton variant="primary" onPress={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </PrimaryButton>
            </View>
          </View>

          <View className="px-6 mt-8 space-y-2.5 pb-8">
            <Link href="/change-password" asChild>
              <TouchableOpacity className="rounded-2xl border border-border bg-surface p-4 flex-row items-center gap-3">
                <View className="h-10 w-10 rounded-xl bg-[#2563eb]/15 items-center justify-center">
                  <KeyRound size={16} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold">Change password</Text>
                  <Text className="text-xs text-muted-foreground">Replace a temporary or old password.</Text>
                </View>
              </TouchableOpacity>
            </Link>
            
            <TouchableOpacity 
              onPress={handleLogout}
              className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex-row items-center gap-3 mt-3"
            >
              <View className="h-10 w-10 rounded-xl bg-destructive/10 items-center justify-center">
                <LogOut size={16} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-destructive">Log out</Text>
                <Text className="text-xs text-muted-foreground">Ends your session on this device.</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
