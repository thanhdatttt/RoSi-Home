import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MobileFrame } from "../../components/MobileFrame";
import { Field } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { Lock, ShieldAlert, Check } from "lucide-react-native";
import { useAuth } from "../../contexts/auth-context";
import { ApiRequestError } from "../../lib/api";
import { useI18n } from "@/i18n/I18nProvider";

export default function ForceChangePassword() {
  const router = useRouter();
  const { changePassword, loading } = useAuth();
  const { t } = useI18n();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const rules = [
    { id: 'minimum-length', label: t('auth.passwordMinimumLength'), ok: next.length >= 8 },
    { id: 'letter', label: t('auth.passwordMustContainLetter'), ok: /[a-zA-Z]/.test(next) },
    { id: 'number', label: t('auth.passwordMustContainNumber'), ok: /\d/.test(next) },
  ];

  async function submit() {
    const errs: Record<string, string> = {};
    if (!current) errs.current = t('auth.temporaryPasswordRequired');
    if (!rules.every((r) => r.ok)) errs.next = t('auth.passwordPolicyNotMet');
    if (confirm !== next) errs.confirm = t('auth.passwordsDoNotMatch');
    setErrors(errs);
    setApiError(null);
    if (Object.keys(errs).length) return;

    try {
      await changePassword({
        currentPassword: current,
        newPassword: next,
        newPasswordConfirmation: confirm,
      });
      router.replace("/login");
    } catch (e: any) {
      if (e instanceof ApiRequestError) {
        if (e.fields) {
          const fieldErrors: Record<string, string> = {};
          const errorKeyByField = {
            currentPassword: 'auth.temporaryPasswordRequired',
            newPassword: 'auth.passwordPolicyNotMet',
            newPasswordConfirmation: 'auth.passwordsDoNotMatch',
          } as const;
          e.fields.forEach((f) => {
            const key = errorKeyByField[f.field as keyof typeof errorKeyByField];
            const nameByField: Record<string, string> = { currentPassword: 'current', newPassword: 'next', newPasswordConfirmation: 'confirm' };
            if (key && nameByField[f.field]) fieldErrors[nameByField[f.field]] = t(key);
          });
          setErrors(fieldErrors);
        } else {
          setApiError(t('auth.passwordSetFailed'));
        }
      } else {
        setApiError(t('auth.passwordSetFailed'));
      }
    }
  }

  return (
    <MobileFrame>
      <View className="flex-1 flex-col bg-background pb-8">
        <View className="px-6 pt-14 pb-4">
          <View className="h-14 w-14 rounded-2xl bg-[#2563eb]/15 items-center justify-center mb-4">
            <ShieldAlert size={24} color="#2563eb" />
          </View>
          <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">{t('auth.firstSignIn')}</Text>
          <Text className="text-2xl font-extrabold leading-tight">{t('auth.setPassword')}</Text>
          <Text className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {t('auth.temporaryPasswordDescription')}
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 pb-6">
          <Field
            label={t('auth.temporaryPassword')}

            secureTextEntry
            placeholder={t('auth.temporaryPasswordPlaceholder')}
            icon={<Lock size={16} color="gray" />}
            value={current}
            onChangeText={setCurrent}
            error={errors.current}
          />
          <Field
            label={t('auth.newPassword')}

            secureTextEntry
            placeholder={t('auth.newPasswordPlaceholder')}
            icon={<Lock size={16} color="gray" />}
            value={next}
            onChangeText={setNext}
            error={errors.next}
          />
          <Field
            label={t('auth.confirmNewPassword')}

            secureTextEntry
            placeholder={t('auth.confirmNewPasswordPlaceholder')}
            icon={<Lock size={16} color="gray" />}
            value={confirm}
            onChangeText={setConfirm}
            error={errors.confirm}
          />

          <View className="rounded-xl border border-border bg-surface p-3.5 mb-4 mt-2">
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t('auth.passwordPolicy')}</Text>
            <View className="gap-1.5">
              {rules.map((r) => (
                <View key={r.id} className="flex-row items-center gap-2">
                  <View className={`h-4 w-4 rounded-full items-center justify-center ${r.ok ? "bg-[#2563eb]" : "bg-secondary"}`}>
                    <Check size={10} color={r.ok ? "#ffffff" : "gray"} />
                  </View>
                  <Text className={r.ok ? "text-foreground text-xs" : "text-muted-foreground text-xs"}>{r.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {apiError ? (
            <View style={{ borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#ef4444' }}>{apiError}</Text>
            </View>
          ) : null}

          <PrimaryButton variant="primary" onPress={submit} disabled={loading}>
            {loading ? t('auth.settingPassword') : t('auth.setPasswordAndContinue')}
          </PrimaryButton>
          <Text className="text-center text-[11px] text-muted-foreground mt-4">
            {t('auth.temporaryPasswordExpiryNotice')}
          </Text>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
