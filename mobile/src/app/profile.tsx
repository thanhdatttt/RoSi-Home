import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "@/components/MobileFrame";
import { Field } from "@/components/ui/Field";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Globe2, Mail, User, ShieldCheck, KeyRound, LogOut } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";

export default function Profile() {
  const { user, token, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage, roleLabel, t } = useI18n();

  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Update local state if the global user context changes
  useEffect(() => {
    if (user) {
      setName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiRequest('/profile', {
        method: 'PATCH',
        token,
        body: { fullName: name }
      });
      // Refresh the global profile cache so the new name appears everywhere
      await refreshProfile();
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

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, paddingTop: Math.max(insets.top + 16, 56) }}>
          <View>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>{t('profile.eyebrow')}</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>{t('profile.title')}</Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}>
          {/* Avatar */}
          <View style={{ paddingHorizontal: 24, alignItems: 'center', paddingTop: 8, paddingBottom: 24 }}>
            <View style={{ height: 80, width: 80, borderRadius: 40, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '800' }}>
                {name ? name.substring(0, 2).toUpperCase() : "US"}
              </Text>
            </View>
            <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(37,99,235,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
              <ShieldCheck size={12} color="#2563eb" />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#2563eb' }}>{roleLabel(user?.role || 'Landlord')}</Text>
            </View>
          </View>

          {/* Form */}
          <View style={{ paddingHorizontal: 24 }}>
            <Field
              label={t('profile.fullName')}
              value={name}
              onChangeText={setName}
              icon={<User size={16} color="gray" />}
            />
            <View style={{ marginTop: 16 }}>
              <Field
                label={t('profile.email')}
                value={email}
                readOnly
                icon={<Mail size={16} color="gray" />}
                hint={t('profile.emailHint')}
              />
            </View>
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#0f172a', marginBottom: 6, marginLeft: 4 }}>{t('profile.role')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(241,245,249,0.5)', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, height: 48, borderRadius: 16 }}>
                <ShieldCheck size={16} color="#64748b" />
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>{roleLabel(user?.role || 'Landlord')}</Text>
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#0f172a', marginBottom: 6, marginLeft: 4 }}>{t('profile.language')}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['vi', 'en'] as const).map((option) => {
                  const selected = language === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => void setLanguage(option)}
                      style={{ flex: 1, height: 48, borderRadius: 16, borderWidth: 1, borderColor: selected ? '#2563eb' : '#e2e8f0', backgroundColor: selected ? 'rgba(37,99,235,0.1)' : '#ffffff', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 }}
                    >
                      <Globe2 size={16} color={selected ? '#2563eb' : '#64748b'} />
                      <Text style={{ color: selected ? '#2563eb' : '#334155', fontSize: 13, fontWeight: '700' }}>{t(option === 'vi' ? 'language.vietnamese' : 'language.english')}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {saved && (
              <View style={{ borderRadius: 8, backgroundColor: 'rgba(37,99,235,0.15)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.3)', paddingHorizontal: 12, paddingVertical: 8, marginTop: 16 }}>
                <Text style={{ fontSize: 12, color: '#2563eb' }}>{t('profile.updated')}</Text>
              </View>
            )}

            <View style={{ marginTop: 16 }}>
              <PrimaryButton variant="primary" onPress={handleSave} disabled={saving}>
                {saving ? t('profile.saving') : t('profile.saveChanges')}
              </PrimaryButton>
            </View>
          </View>

          {/* Actions */}
          <View style={{ paddingHorizontal: 24, marginTop: 32, paddingBottom: 32 }}>
            <Link href="/change-password" asChild>
              <TouchableOpacity style={{ borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                  <KeyRound size={16} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600' }}>{t('profile.changePassword')}</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8' }}>{t('profile.changePasswordHint')}</Text>
                </View>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity
              onPress={handleLogout}
              style={{ borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.05)', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}
            >
              <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={16} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#ef4444' }}>{t('profile.logout')}</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>{t('profile.logoutHint')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
