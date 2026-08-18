import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../components/MobileFrame";
import { Field } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ArrowLeft, Mail } from "lucide-react-native";
import { useAuth } from "../../contexts/auth-context";
import { ApiRequestError } from "../../lib/api";
import { useI18n } from "@/i18n/I18nProvider";

export default function Forgot() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { forgotPassword, loading } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  async function submit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setApiError(t('auth.emailInvalid'));
      return;
    }
    setApiError(null);
    try {
      await forgotPassword(trimmedEmail);
      router.push("/reset-sent");
    } catch (e: any) {
      if (e instanceof ApiRequestError) {
        setApiError(t('auth.passwordResetRequestFailed'));
      } else {
        setApiError(t('auth.passwordResetRequestFailed'));
      }
    }
  }

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Math.max(insets.top + 16, 56) }}>
          <Link href="/login" asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 24) }}>
          <View style={{ height: 56, width: 56, borderRadius: 16, backgroundColor: 'rgba(37,99,235,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Mail size={24} color="#2563eb" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800' }}>{t('auth.forgotPassword')}</Text>
          <Text style={{ fontSize: 14, color: '#94a3b8', marginTop: 8, lineHeight: 20 }}>
            {t('auth.forgotPasswordDescription')}
          </Text>
          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 10, lineHeight: 18 }}>
            {t('auth.forgotPasswordTenantNotice')}
          </Text>
          <View style={{ marginTop: 24, marginBottom: 24 }}>
            <Field
              label={t('auth.email')}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={16} color="gray" />}
              value={email}
              onChangeText={setEmail}
            />
          </View>
          {apiError && (
            <View style={{ borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#ef4444' }}>{apiError}</Text>
            </View>
          )}
          <PrimaryButton variant="primary" onPress={submit} disabled={loading}>
            {loading ? t('auth.sending') : t('auth.sendNewPassword')}
          </PrimaryButton>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 16 }}>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>{t('auth.rememberedPassword')}</Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600', textDecorationLine: 'underline' }}>{t('auth.backToSignIn')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
