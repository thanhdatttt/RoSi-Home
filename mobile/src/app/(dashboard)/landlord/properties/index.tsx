import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { Link, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../components/MobileFrame";
import { Plus, Building2, MapPin, Search, Trash2, ArrowUpRight } from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useAuth } from "../../../../contexts/auth-context";
import {
  deleteProperty,
  listProperties,
  type PropertyView,
} from "../../../../features/portfolio/api";
import { useI18n } from '@/i18n/I18nProvider';

const PAGE_SIZE = 5;

export default function PropertiesList() {
  const router = useRouter();
  const { token } = useAuth();
  const { language, t, translateLegacy } = useI18n();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const [properties, setProperties] = useState<PropertyView[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPropertiesInitial = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await listProperties(token, 1, PAGE_SIZE);
      setProperties(result.data);
      setPage(1);
      setHasMore(result.meta.total > result.meta.page * result.meta.pageSize);
    } catch (err) {
      console.error("Failed to load properties", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchPropertiesInitial();
    }, [fetchPropertiesInitial])
  );

  const loadMore = async () => {
    if (!token || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await listProperties(token, nextPage, PAGE_SIZE);
      setProperties(prev => {
        // Filter out duplicates just in case
        const existingIds = new Set(prev.map(p => p.id));
        const newItems = result.data.filter(d => !existingIds.has(d.id));
        return [...prev, ...newItems];
      });
      setPage(nextPage);
      setHasMore(result.meta.total > result.meta.page * result.meta.pageSize);
    } catch (err) {
      console.error("Failed to load more properties", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const confirmDelete = (property: PropertyView) => {
    Alert.alert(
      t('common.delete'),
      language === 'vi' ? `Bạn có chắc muốn xóa “${property.name}” không? Thao tác này không thể hoàn tác.` : `Are you sure you want to delete "${property.name}"? This action cannot be undone.`,
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProperty(token, property.id);
              fetchPropertiesInitial();
            } catch (err: any) {
              Alert.alert(translateLegacy("Error"), err.message || translateLegacy("Failed to delete property"));
            }
          }
        }
      ]
    );
  };

  const items = properties.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.address.toLowerCase().includes(q.toLowerCase())
  );
  const occupiedUnits = properties.reduce((total, property) => total + (property.occupied || 0), 0);
  const totalUnits = properties.reduce((total, property) => total + (property.units || 0), 0);
  const occupancyRate = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f6f8fc' }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: Math.max(insets.top + 14, 52) }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.7, color: '#5570b5', fontWeight: '800' }}>{t('propertyAdmin.portfolio')}</Text>
            <Text style={{ marginTop: 3, fontSize: 29, lineHeight: 34, letterSpacing: -0.8, color: '#14213d', fontWeight: '800' }}>{t('propertyAdmin.properties')}</Text>
            <Text style={{ marginTop: 5, color: '#718096', fontSize: 13 }}>{t('propertyAdmin.overview')}</Text>
          </View>
          <Link href="/landlord/properties/new" asChild>
            <TouchableOpacity accessibilityLabel={t('propertyAdmin.add')} style={{ height: 48, width: 48, borderRadius: 16, backgroundColor: '#155eef', alignItems: 'center', justifyContent: 'center', shadowColor: '#155eef', shadowOpacity: 0.24, shadowOffset: { width: 0, height: 8 }, shadowRadius: 12, elevation: 5 }}>
              <Plus size={22} strokeWidth={2.5} color="white" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Portfolio snapshot */}
        <View style={{ marginHorizontal: 20, flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, borderRadius: 18, backgroundColor: '#172554', paddingHorizontal: 15, paddingVertical: 14 }}>
            <Text style={{ color: '#aebfe8', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 }}>{t('propertyAdmin.total')}</Text>
            <Text style={{ color: '#ffffff', fontSize: 25, fontWeight: '800', marginTop: 5 }}>{properties.length}</Text>
          </View>
          <View style={{ flex: 1, borderRadius: 18, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f3', paddingHorizontal: 15, paddingVertical: 14 }}>
            <Text style={{ color: '#718096', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 }}>{t('propertyAdmin.occupancy')}</Text>
            <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={{ color: '#14213d', fontSize: 25, fontWeight: '800' }}>{occupancyRate}%</Text>
              <Text style={{ color: '#718096', fontSize: 12 }}>{occupiedUnits}/{totalUnits || 0}</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
          <View style={{ position: 'relative', justifyContent: 'center', shadowColor: '#23365d', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 1 }}>
            <View style={{ position: 'absolute', left: 15, zIndex: 10 }}>
              <Search size={18} color="#7c8ba3" />
            </View>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder={t('propertyAdmin.search')}
              placeholderTextColor="#8796ad"
              style={{ width: '100%', height: 50, borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e1e8f2', paddingLeft: 45, paddingRight: 16, fontSize: 14, color: '#14213d' }}
            />
          </View>
        </View>

        {/* List */}
        <ScrollView style={{ flex: 1, marginTop: 20, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32), gap: 12 }}>
          {!loading && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ color: '#334155', fontSize: 14, fontWeight: '800' }}>{q ? t('propertyAdmin.results', { count: items.length }) : t('propertyAdmin.yourSpaces')}</Text>
              {!q && <Text style={{ color: '#8190a6', fontSize: 12 }}>{t('propertyAdmin.listed', { count: properties.length })}</Text>}
            </View>
          )}
          {loading ? (
            <ActivityIndicator size="large" color="#155eef" style={{ marginTop: 36 }} />
          ) : items.length === 0 ? (
            <View style={{ borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: '#cdd8ea', backgroundColor: '#ffffff', padding: 32, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ height: 44, width: 44, borderRadius: 14, backgroundColor: '#eaf1ff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Building2 size={20} color="#155eef" />
              </View>
              <Text style={{ fontSize: 14, color: '#52627b', textAlign: 'center', lineHeight: 21 }}>
                {q ? t('propertyAdmin.noMatch', { query: q }) : t('propertyAdmin.none')}
              </Text>
            </View>
          ) : (
            items.map((p) => (
              <Swipeable
                key={p.id}
                containerStyle={{ overflow: 'visible' }}
                renderRightActions={() => (
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#e5484d',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 76,
                      borderRadius: 20,
                      marginLeft: 12,
                    }}
                    onPress={() => confirmDelete(p)}
                  >
                    <Trash2 size={24} color="white" />
                  </TouchableOpacity>
                )}
              >
                <Link href={`/landlord/properties/${p.id}`} asChild>
                  <TouchableOpacity style={{ borderRadius: 20, borderWidth: 1, borderColor: '#e1e8f2', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13, shadowColor: '#20345a', shadowOpacity: 0.045, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10, elevation: 1 }}>
                    <View style={{ height: 52, width: 52, borderRadius: 16, backgroundColor: '#eaf1ff', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={22} strokeWidth={2.25} color="#155eef" />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ color: '#172554', fontWeight: '800', fontSize: 15 }} numberOfLines={1}>{p.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 }}>
                        <MapPin size={13} color="#7c8ba3" />
                        <Text style={{ flex: 1, fontSize: 12, color: '#718096' }} numberOfLines={1}>{p.address}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', flexShrink: 0, gap: 6 }}>
                      <View style={{ backgroundColor: '#edf7f1', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 11, color: '#277a51', fontWeight: '800' }}>{p.occupied || 0}/{p.units || 0}</Text>
                      </View>
                      <ArrowUpRight size={15} color="#8a99ae" />
                    </View>
                  </TouchableOpacity>
                </Link>
              </Swipeable>
            ))
          )}
          {!loading && hasMore && items.length > 0 && (
            <TouchableOpacity
              onPress={loadMore}
              disabled={loadingMore}
              style={{ paddingVertical: 13, borderRadius: 16, backgroundColor: '#eaf1ff', alignItems: 'center' }}
            >
              {loadingMore ? <ActivityIndicator size="small" color="#155eef" /> : <Text style={{ color: '#155eef', fontWeight: '800', fontSize: 13 }}>{t('propertyAdmin.loadMore')}</Text>}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
