import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../components/MobileFrame";
import { Field } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ArrowLeft, Mail, Lock, Phone } from "lucide-react-native";
import { useAuth } from "../../contexts/auth-context";
import { ApiRequestError } from "../../lib/api";
import { useI18n } from "@/i18n/I18nProvider";

export default function Login() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  async function submit() {
    if (!identifier || !password) {
      setErr(t('auth.loginCredentialsRequired'));
      return;
    }
    setErr(null);
    try {
      const user = await login(identifier.trim(), password, rememberMe);
      if (user.mustChangePassword) {
        router.push("/force-change-password");
      } else if (user.role === 'Tenant') {
        router.push("/tenant");
      } else {
        router.push("/landlord");
      }
    } catch (e: any) {
      if (e instanceof ApiRequestError && e.code === 'UNAUTHENTICATED') {
        setErr(t('auth.invalidCredentials'));
      } else {
        setErr(t('auth.signInFailed'));
      }
    }
  }

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Math.max(insets.top + 16, 56) }}>
          <Link href="/" asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>{t('auth.welcomeBack')}</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>{t('auth.signInToRosiHome')}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 16, 24) }}>
          <Field
            label={t('auth.loginIdentifier')}
            autoCapitalize="none"
            placeholder={t('auth.loginIdentifierPlaceholder')}
            icon={<Mail size={16} color="gray" />}
            value={identifier}
            onChangeText={setIdentifier}
          />
          <View style={{ marginTop: 12, padding: 14, borderRadius: 14, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', gap: 12 }}>
            <Text style={{ color: '#1e3a8a', fontSize: 12, fontWeight: '700' }}>{t('auth.loginIdentifierHint')}</Text>
            <IdentifierGuide icon={<Mail size={18} color="#2563eb" />} title={t('auth.landlordIdentifierTitle')} hint={t('auth.landlordIdentifierHint')} />
            <IdentifierGuide icon={<Phone size={18} color="#2563eb" />} title={t('auth.tenantIdentifierTitle')} hint={t('auth.tenantIdentifierHint')} />
          </View>
          <View style={{ marginTop: 16 }}>
            <Field
              label={t('auth.password')}
              secureTextEntry
              placeholder={t('auth.passwordPlaceholder')}
              icon={<Lock size={16} color="gray" />}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                thumbColor="#ffffff"
              />
              <Text style={{ fontSize: 12, color: '#64748b' }}>{t('auth.rememberMe')}</Text>
            </View>
            <Link href="/forgot-password" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600' }}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {err && (
            <View style={{ borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#ef4444' }}>{err}</Text>
            </View>
          )}

          <PrimaryButton variant="primary" onPress={submit} disabled={loading}>
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </PrimaryButton>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 16 }}>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>{t('auth.noAccountYet')}</Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600', textDecorationLine: 'underline' }}>{t('auth.registerLandlord')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </MobileFrame>
  );
}

function IdentifierGuide({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
      <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#1e3a8a', fontSize: 12, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: '#475569', fontSize: 12, lineHeight: 17, marginTop: 2 }}>{hint}</Text>
      </View>
    </View>
  );
}
