import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Link, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../components/MobileFrame";
import { ArrowLeft, Plus, Building2, MapPin, Search } from "lucide-react-native";
import { useAuth } from "../../../../contexts/auth-context";
import { apiRequest } from "../../../../lib/api";

export default function PropertiesList() {
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function fetchProperties() {
        if (!token) return;
        setLoading(true);
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
    }, [token])
  );

  const items = properties.filter((p) => 
    p.name.toLowerCase().includes(q.toLowerCase()) || 
    p.address.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Math.max(insets.top + 16, 56) }}>
          <Link href="/landlord" asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Portfolio</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>Properties</Text>
          </View>
          <Link href="/landlord/properties/new" asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={16} color="white" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <View style={{ position: 'absolute', left: 14, zIndex: 10 }}>
              <Search size={16} color="gray" />
            </View>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search by name or address"
              placeholderTextColor="gray"
              style={{ width: '100%', height: 44, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 40, paddingRight: 16, fontSize: 14 }}
            />
          </View>
        </View>

        {/* List */}
        <ScrollView style={{ flex: 1, marginTop: 16, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32), gap: 12 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 32 }} />
          ) : items.length === 0 ? (
            <View style={{ borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: '#e2e8f0', padding: 32, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
                {q ? `No properties match "${q}".` : "You haven't added any properties yet."}
              </Text>
            </View>
          ) : (
            items.map((p) => (
              <Link key={p.id} href={`/landlord/properties/${p.id}`} asChild>
                <TouchableOpacity style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ height: 48, width: 48, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={20} color="#2563eb" />
                  </View>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14 }} numberOfLines={1}>{p.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={12} color="gray" />
                      <Text style={{ fontSize: 12, color: '#94a3b8' }} numberOfLines={1}>{p.address}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700' }}>0/0</Text>
                    <Text style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>occupied</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            ))
          )}
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
