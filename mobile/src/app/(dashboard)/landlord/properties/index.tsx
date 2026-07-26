import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { MobileFrame } from "../../../../components/MobileFrame";
import { ArrowLeft, Plus, Building2, MapPin, Search } from "lucide-react-native";
import { useAuth } from "../../../../contexts/auth-context";
import { apiRequest } from "../../../../lib/api";

export default function PropertiesList() {
  const router = useRouter();
  const { token } = useAuth();
  const [q, setQ] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      if (!token) return;
      try {
        const data = await apiRequest<any[]>('/properties', { token });
        setProperties(data);
      } catch (err) {
        console.error("Failed to load properties", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, [token]);

  const items = properties.filter((p) => 
    p.name.toLowerCase().includes(q.toLowerCase()) || 
    p.address.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <MobileFrame>
      <View className="flex-1 flex-col bg-background pb-8">
        <View className="px-6 pt-14 pb-4 flex-row items-center gap-3">
          <Link href="/landlord" asChild>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View className="flex-1 pr-2">
            <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">Portfolio</Text>
            <Text className="text-2xl font-extrabold leading-tight">Properties</Text>
          </View>
          <Link href="/landlord/properties/new" asChild>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-[#2563eb] items-center justify-center">
              <Plus size={16} color="white" />
            </TouchableOpacity>
          </Link>
        </View>

        <View className="px-6">
          <View className="relative justify-center">
            <View className="absolute left-3.5 z-10">
              <Search size={16} color="gray" />
            </View>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search by name or address"
              className="w-full h-11 rounded-xl bg-surface border border-border pl-10 pr-4 text-sm"
              placeholderTextColor="gray"
            />
          </View>
        </View>

        <ScrollView className="flex-1 mt-4 px-6" showsVerticalScrollIndicator={false}>
          <View className="space-y-3">
            {loading ? (
              <ActivityIndicator size="large" color="#2563eb" className="mt-8" />
            ) : items.length === 0 ? (
              <View className="rounded-2xl border border-dashed border-border p-8 items-center justify-center">
                <Text className="text-sm text-muted-foreground text-center">
                  {q ? `No properties match "${q}".` : "You haven't added any properties yet."}
                </Text>
              </View>
            ) : (
              items.map((p) => (
                <Link
                  key={p.id}
                  href={`/landlord/properties/${p.id}`}
                  asChild
                >
                  <TouchableOpacity className="rounded-2xl border border-border bg-surface p-4 flex-row items-center gap-3">
                    <View className="h-12 w-12 rounded-xl bg-primary/10 items-center justify-center shrink-0">
                      <Building2 size={20} color="#2563eb" />
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="font-semibold text-sm" numberOfLines={1}>{p.name}</Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <MapPin size={12} color="gray" />
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>{p.address}</Text>
                      </View>
                    </View>
                    <View className="items-end shrink-0">
                      <Text className="text-sm font-bold">0/0</Text>
                      <Text className="text-[10px] text-muted-foreground uppercase tracking-wide">occupied</Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
