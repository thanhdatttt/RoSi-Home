import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../components/MobileFrame";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { Home, KeyRound } from "lucide-react-native";
import { useI18n } from "@/i18n/I18nProvider";

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  return (
    <MobileFrame>
      <LinearGradient
        colors={['#0c1a3a', '#0a1228', '#060d1e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={{ flex: 1, overflow: 'hidden' }}>
        {/* Background Orbs with blur */}
        <View style={{
          position: 'absolute', top: -96, right: -64,
          height: 256, width: 256, borderRadius: 128,
          backgroundColor: 'rgba(37, 99, 235, 0.25)',
          shadowColor: '#2563eb', shadowRadius: 80, shadowOpacity: 0.4,
          elevation: 0,
        }} />
        <View style={{
          position: 'absolute', bottom: 128, left: -80,
          height: 256, width: 256, borderRadius: 128,
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          shadowColor: '#2563eb', shadowRadius: 80, shadowOpacity: 0.3,
          elevation: 0,
        }} />

        <View className="flex-1 flex-col px-7" style={{ paddingTop: Math.max(insets.top + 24, 64) }}>
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 rounded-xl bg-[#2563eb] items-center justify-center">
              <Home size={20} color="#ffffff" />
            </View>
            <Text className="font-bold tracking-tight text-lg text-white">RosiHome</Text>
          </View>

          <View className="mt-auto mb-10">
            <Text className="text-[#60a5fa] text-xs uppercase tracking-[4px] mb-4">{t('welcome.tagline')}</Text>
            <Text className="font-extrabold text-[38px] leading-[40px] text-white">
              {t('welcome.title')}
            </Text>
            <Text style={{ marginTop: 16, fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 22 }}>
              {t('welcome.description')}
            </Text>
          </View>
        </View>

        <View style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingHorizontal: 28,
          paddingTop: 28,
          paddingBottom: Math.max(insets.bottom + 16, 32),
          gap: 12,
        }}>
          <Link href="/register" asChild>
            <PrimaryButton variant="primary">
              {t('welcome.createLandlord')}
            </PrimaryButton>
          </Link>

          <Link href="/login" asChild>
            <PrimaryButton variant="outline">
              <View className="flex-row items-center justify-center gap-2">
                <KeyRound size={16} color="black" />
                <Text style={{ color: '#101828', fontWeight: '600', fontSize: 14 }}>{t('auth.signIn')}</Text>
              </View>
            </PrimaryButton>
          </Link>

          <Text style={{ textAlign: 'center', fontSize: 11, color: '#667085', paddingTop: 4 }}>
            {t('welcome.tenantHint')}
          </Text>
        </View>
      </View>
    </MobileFrame>
  );
}
