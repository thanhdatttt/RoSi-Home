import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../components/MobileFrame";
import { ArrowLeft, Search, UserPlus, User, Phone } from "lucide-react-native";
import { useAuth } from "../../../../contexts/auth-context";
import { listTenants, type TenantView } from "../../../../features/leasing/api";
import { useI18n } from '@/i18n/I18nProvider';

export default function TenantsList() {
  const { token } = useAuth();
  const { t: translate } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const [tenants, setTenants] = useState<TenantView[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function loadTenants() {
        if (!token) {
          setLoading(false);
          return;
        }
        try {
          const response = await listTenants(token);
          setTenants(response.data);
        } catch (err) {
          console.error("Failed to load tenants", err);
        } finally {
          setLoading(false);
        }
      }
      loadTenants();
    }, [token])
  );

  const items = tenants.filter((t) =>
    (t.fullName + t.phone).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Math.max(insets.top + 16, 56) }}>
          <Link href="/landlord" asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>{translate('tenantAdmin.portfolio')}</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>{translate('tenantAdmin.tenants')}</Text>
          </View>
          <Link href="/landlord/leases/new" asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={16} color="white" />
            </TouchableOpacity>
          </Link>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <View style={{ position: 'absolute', left: 14, zIndex: 10 }}>
              <Search size={16} color="gray" />
            </View>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder={translate('tenantAdmin.search')}
              placeholderTextColor="gray"
              style={{ width: '100%', height: 44, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 40, paddingRight: 16, fontSize: 14 }}
            />
          </View>
        </View>

        <ScrollView style={{ flex: 1, marginTop: 16, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32), gap: 8 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 32 }} />
          ) : items.length === 0 ? (
            <View style={{ borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: '#e2e8f0', padding: 32, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
                {q ? translate('tenantAdmin.noMatch', { query: q }) : translate('tenantAdmin.none')}
              </Text>
            </View>
          ) : (
            items.map((t) => (
              <TouchableOpacity key={t.id} onPress={() => router.push({ pathname: "/(dashboard)/landlord/tenants/[id]", params: { id: t.id } } as any)} activeOpacity={0.7} style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ height: 44, width: 44, borderRadius: 22, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={20} color="#2563eb" />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontWeight: '600', fontSize: 14 }} numberOfLines={1}>{t.fullName}</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }} numberOfLines={1}>{t.email || translate('tenantAdmin.noEmail')}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <Phone size={12} color="#94a3b8" />
                  <Text style={{ fontSize: 11, color: '#94a3b8' }}>{t.phone}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
