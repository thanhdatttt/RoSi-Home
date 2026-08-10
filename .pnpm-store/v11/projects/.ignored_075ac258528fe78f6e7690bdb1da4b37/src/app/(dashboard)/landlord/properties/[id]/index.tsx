import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MobileFrame } from "../../../../../components/MobileFrame";
import { ArrowLeft, Pencil, Plus, DoorOpen, Zap, Droplets, Receipt, Building2, MapPin, ChevronRight } from "lucide-react-native";
import { useAuth } from "../../../../../contexts/auth-context";
import { apiRequest } from "../../../../../lib/api";

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  
  const [property, setProperty] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const [propData, roomsData] = await Promise.all([
          apiRequest<any>(`/properties/${id}`, { token }),
          apiRequest<any[]>(`/rooms/properties/${id}`, { token })
        ]);
        setProperty(propData);
        setRooms(roomsData);
      } catch (err) {
        console.error("Failed to load property details", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, token]);

  if (loading) {
    return (
      <MobileFrame>
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MobileFrame>
    );
  }

  if (!property) {
    return (
      <MobileFrame>
        <View className="flex-1 items-center justify-center bg-background px-6">
          <Text className="text-muted-foreground text-center">Property not found.</Text>
          <Link href="/landlord/properties" asChild>
            <TouchableOpacity className="mt-4 px-4 py-2 bg-secondary rounded-lg">
              <Text className="font-semibold">Go back</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </MobileFrame>
    );
  }

  const occupiedCount = rooms.filter(r => r.occupied).length;

  return (
    <MobileFrame>
      <View className="flex-1 flex-col bg-background pb-8">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-14 pb-6 overflow-hidden relative rounded-b-[32px]">
            <LinearGradient 
              colors={["#1e3a8a", "#0f172a"]} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            
            <View className="flex-row items-center gap-3">
              <Link href="/landlord/properties" asChild>
                <TouchableOpacity className="h-10 w-10 rounded-full bg-white/10 items-center justify-center">
                  <ArrowLeft size={16} color="white" />
                </TouchableOpacity>
              </Link>
              <View className="flex-1 pr-2">
                <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">Property</Text>
                <Text className="text-xl font-extrabold text-white" numberOfLines={1}>{property.name}</Text>
              </View>
              <Link href={`/landlord/properties/${id}/edit`} asChild>
                <TouchableOpacity className="h-10 w-10 rounded-full bg-white/10 items-center justify-center">
                  <Pencil size={16} color="white" />
                </TouchableOpacity>
              </Link>
            </View>

            <View className="mt-5 flex-row items-center gap-2">
              <MapPin size={14} color="rgba(255,255,255,0.7)" />
              <Text className="text-sm text-white/80" numberOfLines={1}>{property.address}</Text>
            </View>

            <View className="mt-4 flex-row items-center justify-between">
              <View className="flex-1 rounded-xl bg-white/10 border border-white/10 p-3 items-center mr-2">
                <Text className="text-lg font-extrabold text-white">{rooms.length}</Text>
                <Text className="text-[10px] uppercase tracking-wide text-white/70 mt-0.5">Rooms</Text>
              </View>
              <View className="flex-1 rounded-xl bg-white/10 border border-white/10 p-3 items-center mr-2">
                <Text className="text-lg font-extrabold text-white">{occupiedCount}/{rooms.length}</Text>
                <Text className="text-[10px] uppercase tracking-wide text-white/70 mt-0.5">Occupied</Text>
              </View>
              <View className="flex-1 rounded-xl bg-white/10 border border-white/10 p-3 items-center">
                <Text className="text-lg font-extrabold text-white">{rooms.length - occupiedCount}</Text>
                <Text className="text-[10px] uppercase tracking-wide text-white/70 mt-0.5">Vacant</Text>
              </View>
            </View>
          </View>

          <View className="px-6 -mt-4">
            <View className="flex-row justify-between rounded-2xl bg-surface border border-border p-3 shadow-sm">
              <View className="flex-1">
                <ConfigLink href={`/landlord/properties/${id}/utilities`} icon={<Zap size={16} color="#2563eb" />} label="Utilities" />
              </View>
              <View className="flex-1">
                <ConfigLink href={`/landlord/properties/${id}/surcharges`} icon={<Receipt size={16} color="#2563eb" />} label="Surcharges" />
              </View>
              <View className="flex-1">
                <ConfigLink href={`/landlord/properties/${id}/rooms/new`} icon={<Plus size={16} color="white" />} label="Add rooms" highlight />
              </View>
            </View>
          </View>

          <View className="px-6 mt-8">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Rooms</Text>
              <Link href={`/landlord/properties/${id}/rooms/new`} asChild>
                <TouchableOpacity>
                  <Text className="text-xs text-primary font-semibold">+ Add</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <View className="space-y-2">
              {rooms.length === 0 ? (
                <View className="p-4 rounded-xl border border-dashed border-border items-center">
                  <Text className="text-xs text-muted-foreground">No rooms configured yet.</Text>
                </View>
              ) : (
                rooms.map((r) => (
                  <Link
                    key={r.id}
                    href={`/landlord/properties/${id}/rooms/${r.id}`}
                    asChild
                  >
                    <TouchableOpacity className="rounded-2xl border border-border bg-surface p-4 flex-row items-center gap-3">
                      <View className="h-11 w-11 rounded-xl bg-[#2563eb]/15 items-center justify-center shrink-0">
                        <DoorOpen size={20} color="#2563eb" />
                      </View>
                      <View className="flex-1 pr-2">
                        <Text className="text-sm font-semibold" numberOfLines={1}>{r.name || "Unnamed Room"}</Text>
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                          {r.occupied ? "Occupied" : "No active lease"}
                        </Text>
                      </View>
                      <View className="items-end shrink-0">
                        <Text className="text-sm font-bold">{r.rentAmount?.toLocaleString() || 0} VNĐ</Text>
                        <View className={`mt-1 px-2 py-0.5 rounded-full ${r.occupied ? "bg-[#2563eb]/20" : "bg-secondary"}`}>
                          <Text className={`text-[10px] font-semibold uppercase tracking-wide ${r.occupied ? "text-[#2563eb]" : "text-muted-foreground"}`}>
                            {r.occupied ? "Occupied" : "Vacant"}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Link>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}

function ConfigLink({ href, icon, label, highlight }: { href: string; icon: React.ReactNode; label: string; highlight?: boolean }) {
  return (
    <Link href={href as any} asChild>
      <TouchableOpacity className="flex-col items-center gap-1.5 py-2">
        <View className={`h-10 w-10 rounded-xl items-center justify-center ${highlight ? "bg-[#2563eb]" : "bg-primary/10"}`}>
          {icon}
        </View>
        <Text className="text-[10px] font-semibold text-foreground text-center">{label}</Text>
      </TouchableOpacity>
    </Link>
  );
}
