import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../components/MobileFrame";
import { Field } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ArrowLeft, Mail, Lock, User, Building2 } from "lucide-react-native";
import { useAuth } from "../../contexts/auth-context";
import { ApiRequestError } from "../../lib/api";
import { useI18n } from "@/i18n/I18nProvider";

export default function Register() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  function set(k: keyof typeof values, v: string) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function submit() {
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = t('auth.fullNameRequired');
    if (!values.email.trim()) errs.email = t('auth.emailRequired');
    else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errs.email = t('auth.emailInvalid');
    if (values.password.length < 8) errs.password = t('auth.passwordMinimumLength');
    if (!/[A-Za-z]/.test(values.password)) errs.password = t('auth.passwordMustContainLetter');
    if (!/[0-9]/.test(values.password)) errs.password = t('auth.passwordMustContainNumber');
    if (values.confirm !== values.password) errs.confirm = t('auth.passwordsDoNotMatch');

    setErrors(errs);
    setApiError(null);
    if (Object.keys(errs).length) return;

    try {
      await register({
        fullName: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        passwordConfirmation: values.confirm,
      });
      router.replace("/login");
    } catch (e: any) {
      if (e instanceof ApiRequestError) {
        if (e.fields) {
          const fieldErrors: Record<string, string> = {};
          const errorKeyByField = {
            fullName: 'auth.fullNameRequired',
            email: 'auth.emailInvalid',
            password: 'auth.passwordPolicyNotMet',
            passwordConfirmation: 'auth.passwordsDoNotMatch',
          } as const;
          e.fields.forEach((f) => {
            const key = errorKeyByField[f.field as keyof typeof errorKeyByField];
            const nameByField: Record<string, keyof typeof values> = {
              fullName: 'name', email: 'email', password: 'password', passwordConfirmation: 'confirm',
            };
            if (key && nameByField[f.field]) fieldErrors[nameByField[f.field]] = t(key);
          });
          setErrors(fieldErrors);
        } else {
          setApiError(t('auth.registrationFailed'));
        }
      } else {
        setApiError(t('auth.registrationFailed'));
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
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>{t('auth.landlordSignUp')}</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>{t('auth.createYourAccount')}</Text>
          </View>
        </View>

        {/* Form */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 24) }}>
          {/* Info banner */}
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(37,99,235,0.3)', backgroundColor: 'rgba(37,99,235,0.1)', padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <View style={{ height: 36, width: 36, borderRadius: 8, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={16} color="#ffffff" />
            </View>
            <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)', lineHeight: 18, flex: 1 }}>
              {t('auth.landlordRegistrationNotice')}
            </Text>
          </View>

          <Field
            label={t('profile.fullName')}
            placeholder={t('auth.fullNamePlaceholder')}
            icon={<User size={16} color="gray" />}
            value={values.name}
            onChangeText={(text) => set("name", text)}
            error={errors.name}
          />
          <View style={{ marginTop: 16 }}>
            <Field
              label={t('auth.email')}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@email.com"
              icon={<Mail size={16} color="gray" />}
              value={values.email}
              onChangeText={(text) => set("email", text)}
              error={errors.email}
              hint={t('auth.landlordEmailIdentifierHint')}
            />
          </View>
          <View style={{ marginTop: 16 }}>
            <Field
              label={t('auth.password')}
              secureTextEntry
              placeholder={t('auth.passwordMinimumPlaceholder')}
              icon={<Lock size={16} color="gray" />}
              value={values.password}
              onChangeText={(text) => set("password", text)}
              error={errors.password}
            />
          </View>
          <View style={{ marginTop: 16 }}>
            <Field
              label={t('auth.confirmPassword')}
              secureTextEntry
              placeholder={t('auth.confirmPasswordPlaceholder')}
              icon={<Lock size={16} color="gray" />}
              value={values.confirm}
              onChangeText={(text) => set("confirm", text)}
              error={errors.confirm}
            />
          </View>

          {apiError && (
            <View style={{ borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 12, paddingVertical: 8, marginTop: 16 }}>
              <Text style={{ fontSize: 12, color: '#ef4444' }}>{apiError}</Text>
            </View>
          )}

          <View style={{ marginTop: 16 }}>
            <PrimaryButton variant="primary" onPress={submit} disabled={loading}>
              {loading ? t('auth.creatingAccount') : t('auth.createLandlordAccount')}
            </PrimaryButton>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 16 }}>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>{t('auth.alreadyRegistered')}</Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600', textDecorationLine: 'underline' }}>{t('auth.signIn')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
