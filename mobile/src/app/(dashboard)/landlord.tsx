import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MobileFrame } from "../../components/MobileFrame";
import { Building2, Users, Wrench, Bell, TrendingUp, UserCircle2, UserPlus } from "lucide-react-native";
import { useAuth } from "../../contexts/auth-context";
import { apiRequest } from "../../lib/api";

export default function LandlordDashboard() {
  const { token, user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const propertiesData = await apiRequest<any[]>('/properties?pageSize=3', { token });
        setProperties(propertiesData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : "Landlord";

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
      <View className="flex-1 flex-col bg-background">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-14 pb-12 rounded-b-[32px] overflow-hidden relative">
            <LinearGradient 
              colors={["#1e3a8a", "#0f172a"]} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[11px] uppercase tracking-widest text-[#60a5fa] font-semibold">Landlord</Text>
                <Text className="text-2xl font-extrabold text-white mt-1" numberOfLines={1}>Hi, {firstName}</Text>
                <Text className="text-xs text-white/70 mt-1">{properties.length} properties · 11 tenants</Text>
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
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-white/70">This month collected</Text>
                  <Text className="text-3xl font-extrabold text-white mt-1">11,400,000 VNĐ</Text>
                </View>
                <View className="flex-row items-center gap-1 bg-[#2563eb]/30 px-2.5 py-1 rounded-full">
                  <TrendingUp size={12} color="#60a5fa" />
                  <Text className="text-xs text-[#60a5fa] font-semibold">+8%</Text>
                </View>
              </View>
              <View className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <View className="h-full w-[72%] bg-[#60a5fa]" />
              </View>
              <Text className="text-[11px] text-white/70 mt-2">72% of expected rent received</Text>
            </View>
          </View>

          <View className="px-6 -mt-8">
            <View className="flex-row flex-wrap rounded-3xl bg-surface border border-border p-4 shadow-sm">
              <View className="w-1/4">
                <QuickActionLink to="/landlord/properties" icon={<Building2 size={16} color="#2563eb" />} label="Properties" />
              </View>
              <View className="w-1/4">
                <QuickActionLink to="/landlord/tenants" icon={<Users size={16} color="#2563eb" />} label="Tenants" />
              </View>
              <View className="w-1/4">
                <QuickActionLink to="/landlord/tenants/new" icon={<UserPlus size={16} color="white" />} label="Add tenant" blue />
              </View>
              <View className="w-1/4">
                <QuickAction icon={<Wrench size={16} color="#2563eb" />} label="Repairs" />
              </View>
            </View>
          </View>

          <View className="px-6 mt-8">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Properties</Text>
              <Link href="/landlord/properties" asChild>
                <TouchableOpacity>
                  <Text className="text-xs text-primary font-semibold">See all</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <View className="gap-3">
              {properties.length > 0 ? (
                properties.map((prop) => (
                  <PropertyCard 
                    key={prop.id} 
                    id={prop.id} 
                    title={prop.name} 
                    address={prop.address} 
                    units={0} 
                    occupied={0} 
                  />
                ))
              ) : (
                <Text className="text-sm text-muted-foreground text-center py-4">No properties found.</Text>
              )}
            </View>
          </View>


          <View className="px-6 mt-8">
            <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Recent activity</Text>
            <View className="rounded-2xl border border-border bg-surface overflow-hidden">
              <Activity title="Rent received" who="Kojo M. · Adenta Court #3" amount="+3,800,000 VNĐ" />
              <View className="h-[1px] bg-border ml-4" />
              <Activity title="Maintenance request" who="Ridge Villa · Plumbing" amount="Open" muted />
              <View className="h-[1px] bg-border ml-4" />
              <Activity title="New tenant onboarded" who="Ama D. · Cantonments Lofts" amount="Done" muted />
            </View>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <TouchableOpacity className="flex-col items-center gap-1.5 py-2">
      <View className="h-10 w-10 rounded-xl bg-[#2563eb]/15 items-center justify-center">{icon}</View>
      <Text className="text-[10px] font-semibold text-foreground text-center">{label}</Text>
    </TouchableOpacity>
  );
}

function QuickActionLink({ to, icon, label, blue }: { to: string; icon: React.ReactNode; label: string; blue?: boolean }) {
  return (
    <Link href={to as any} asChild>
      <TouchableOpacity className="flex-col items-center gap-1.5 py-2">
        <View className={`h-10 w-10 rounded-xl items-center justify-center ${blue ? "bg-[#2563eb]" : "bg-[#2563eb]/15"}`}>
          {icon}
        </View>
        <Text className="text-[10px] font-semibold text-foreground text-center">{label}</Text>
      </TouchableOpacity>
    </Link>
  );
}

function PropertyCard({ id, title, address, units, occupied }: { id: string; title: string; address: string; units: number; occupied: number }) {
  return (
    <Link href={{ pathname: "/landlord/properties/[id]", params: { id } } as any} asChild>
      <TouchableOpacity className="rounded-2xl border border-border bg-surface p-4 flex-row items-center gap-3">
        <View className="h-12 w-12 rounded-xl bg-primary/10 items-center justify-center shrink-0">
          <Building2 size={20} color="#2563eb" />
        </View>
        <View className="flex-1 pr-2">
          <Text className="font-semibold text-sm" numberOfLines={1}>{title}</Text>
          <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>{address}</Text>
        </View>
        <View className="items-end shrink-0">
          <Text className="text-sm font-bold">{occupied}/{units}</Text>
          <Text className="text-[10px] text-muted-foreground uppercase tracking-wide">occupied</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

function Activity({ title, who, amount, muted }: { title: string; who: string; amount: string; muted?: boolean }) {
  return (
    <View className="p-4 flex-row items-center gap-3">
      <View className="flex-1 pr-2">
        <Text className="text-sm font-semibold" numberOfLines={1}>{title}</Text>
        <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>{who}</Text>
      </View>
      <Text className={`text-xs font-semibold shrink-0 ${muted ? "text-muted-foreground" : "text-primary"}`}>{amount}</Text>
    </View>
  );
}
