import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { MobileFrame } from "@/components/MobileFrame";
import { Field } from "@/components/ui/Field";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ArrowLeft, Mail, User, ShieldCheck, KeyRound, LogOut } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Use real user data if available, fallback to mock
  const [name, setName] = useState(user?.fullName || "Amelia Osei");
  const [email] = useState(user?.email || "amelia@rosihome.app");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

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
                {name.substring(0, 2).toUpperCase()}
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
            <Field 
              label="Role" 
              value={user?.role || "Landlord"} 
              readOnly 
              icon={<ShieldCheck size={16} color="gray" />} 
              hint="Role can't be changed from the profile screen." 
            />

            {saved && (
              <View className="rounded-lg bg-[#2563eb]/15 border border-[#2563eb]/30 px-3 py-2 mt-2">
                <Text className="text-xs text-[#2563eb]">Profile updated.</Text>
              </View>
            )}

            <View className="pt-2">
              <PrimaryButton variant="primary" onPress={handleSave}>
                Save changes
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
