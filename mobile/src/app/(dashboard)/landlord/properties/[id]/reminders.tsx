import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from "react-native";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../../../../components/MobileFrame";
import { ArrowLeft, BellRing, Check } from "lucide-react-native";
import { useAuth } from "../../../../../contexts/auth-context";
import {
  getLeaseReminderConfig,
  updateLeaseReminderConfig,
} from "../../../../../features/leasing/api";
import { getProperty, type PropertyView } from "../../../../../features/portfolio/api";
import { PrimaryButton } from "../../../../../components/ui/PrimaryButton";

const OFFSETS = [30, 15, 7] as const;

export default function Reminders() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  const [property, setProperty] = useState<PropertyView | null>(null);
  const [on, setOn] = useState<Record<number, boolean>>({ 30: false, 15: false, 7: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchConfig = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    try {
      const [propData, configData] = await Promise.all([
        getProperty(token, id),
        getLeaseReminderConfig(token, id),
      ]);
      setProperty(propData);
      setOn({
        30: configData.remindAt30Days ?? true,
        15: configData.remindAt15Days ?? false,
        7: configData.remindAt7Days ?? false,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await updateLeaseReminderConfig(token, id, {
          remindAt30Days: on[30],
          remindAt15Days: on[15],
          remindAt7Days: on[7],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (days: number, value: boolean) => {
    setOn(prev => ({ ...prev, [days]: value }));
    setSaved(false);
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
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 56), paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Link href={{ pathname: "/(dashboard)/landlord/properties/[id]", params: { id } } as any} asChild>
              <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={16} color="black" />
              </TouchableOpacity>
            </Link>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }} numberOfLines={1}>{property?.name || 'Property'}</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a' }}>Lease reminders</Text>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 24, 32), gap: 16 }}>
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 14, flexDirection: 'row', gap: 8 }}>
            <BellRing size={16} color="#2563eb" style={{ marginTop: 2 }} />
            <Text style={{ flex: 1, fontSize: 12, color: '#0f172a', lineHeight: 18 }}>
              These settings request reminders for the landlord and assigned tenant on active leases. Actual push delivery is verified separately from saving this configuration.
            </Text>
          </View>

          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', overflow: 'hidden' }}>
            {OFFSETS.map((d, index) => (
              <View key={d} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: index < OFFSETS.length - 1 ? 1 : 0, borderBottomColor: '#f1f5f9' }}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{d} days before expiration</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Configured for landlord + tenant</Text>
                </View>
                <Switch
                  value={on[d]}
                  onValueChange={(val) => toggle(d, val)}
                  trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                  thumbColor="#ffffff"
                />
              </View>
            ))}
          </View>

          <View style={{ marginTop: 8 }}>
            <PrimaryButton onPress={saveConfig} disabled={saving}>
              {saving ? "Saving..." : "Save reminder settings"}
            </PrimaryButton>

            {saved && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                <Check size={16} color="#2563eb" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#2563eb' }}>Saved for {property?.name}</Text>
              </View>
            )}
          </View>

          <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 16, marginTop: 16 }}>
            Ended or already expired leases never receive expiration reminders.
          </Text>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
