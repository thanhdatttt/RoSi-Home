import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MobileFrame } from "../../components/MobileFrame";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { Bell, UserCircle2, Wallet, Wrench, FileText, ChevronRight, ShieldAlert } from "lucide-react-native";

export default function TenantDashboard() {
  return (
    <MobileFrame>
      <View className="flex-1 flex-col bg-background">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-14 pb-12 rounded-b-[32px] overflow-hidden relative">
            <LinearGradient 
              colors={["#1e3a8a", "#0f172a"]} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[11px] uppercase tracking-widest text-[#60a5fa] font-semibold">Tenant</Text>
                <Text className="text-2xl font-extrabold text-white mt-1" numberOfLines={1}>Welcome, Kojo</Text>
                <Text className="text-xs text-white/70 mt-1">Adenta Court · Unit #3</Text>
              </View>
              <View className="flex-row items-center gap-2 shrink-0">
                <TouchableOpacity className="h-10 w-10 rounded-full bg-white/10 items-center justify-center">
                  <Bell size={16} color="white" />
                </TouchableOpacity>
                <Link href="/profile" asChild>
                  <TouchableOpacity className="h-10 w-10 rounded-full bg-white/10 items-center justify-center">
                    <UserCircle2 size={16} color="white" />
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            <View className="mt-6 rounded-3xl bg-white/10 border border-white/20 p-5">
              <Text className="text-xs text-white/70">Next payment due</Text>
              <View className="flex-row items-baseline justify-between mt-1">
                <Text className="text-3xl font-extrabold text-white">GHS 1,200</Text>
                <Text className="text-xs text-[#60a5fa] font-semibold">in 6 days</Text>
              </View>
              <View className="mt-4">
                <PrimaryButton variant="primary">Pay now</PrimaryButton>
              </View>
            </View>
          </View>

          <View className="px-6 mt-8 gap-3">
            <TenantRow icon={<Wallet size={16} color="#2563eb" />} title="Payment history" sub="View last 12 months" />
            <TenantRow icon={<Wrench size={16} color="#2563eb" />} title="Report a repair" sub="Plumbing, electricity, etc." />
            <TenantRow icon={<FileText size={16} color="#2563eb" />} title="My lease & documents" sub="Signed 12 Jan 2026" />
          </View>

          <View className="px-6 mt-6">
            <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Announcements</Text>
            <View className="rounded-2xl border border-border bg-surface p-4">
              <Text className="text-sm font-semibold">Water maintenance on Saturday</Text>
              <Text className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Supply will be off between 9am–1pm as scheduled by GWCL. Sorry for the inconvenience.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}

function TenantRow({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <TouchableOpacity className="w-full rounded-2xl border border-border bg-surface p-4 flex-row items-center gap-3">
      <View className="h-10 w-10 rounded-xl bg-[#2563eb]/15 items-center justify-center shrink-0">{icon}</View>
      <View className="flex-1 pr-2">
        <Text className="text-sm font-semibold" numberOfLines={1}>{title}</Text>
        <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>{sub}</Text>
      </View>
      <ChevronRight size={16} color="gray" />
    </TouchableOpacity>
  );
}
