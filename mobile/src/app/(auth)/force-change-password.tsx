import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MobileFrame } from "../../components/MobileFrame";
import { Field } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { Lock, ShieldAlert, Check } from "lucide-react-native";
import { useAuth } from "../../contexts/auth-context";
import { ApiRequestError } from "../../lib/api";

export default function ForceChangePassword() {
  const router = useRouter();
  const { changePassword, loading } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const rules = [
    { label: "At least 8 characters", ok: next.length >= 8 },
    { label: "At least 1 letter", ok: /[a-zA-Z]/.test(next) },
    { label: "At least 1 number", ok: /\d/.test(next) },
  ];

  async function submit() {
    const errs: Record<string, string> = {};
    if (!current) errs.current = "Enter your temporary password";
    if (!rules.every((r) => r.ok)) errs.next = "Password doesn't meet the policy";
    if (confirm !== next) errs.confirm = "Passwords don't match";
    setErrors(errs);
    setApiError(null);
    if (Object.keys(errs).length) return;

    try {
      await changePassword({
        currentPassword: current,
        newPassword: next,
        newPasswordConfirmation: confirm,
      });
      router.push("/tenant");
    } catch (e: any) {
      if (e instanceof ApiRequestError) {
        if (e.fields) {
          const fieldErrors: Record<string, string> = {};
          e.fields.forEach((f) => {
            if (f.field === 'currentPassword') fieldErrors.current = f.message;
            if (f.field === 'newPassword') fieldErrors.next = f.message;
            if (f.field === 'newPasswordConfirmation') fieldErrors.confirm = f.message;
          });
          setErrors(fieldErrors);
        } else {
          setApiError(e.message || "Failed to set password.");
        }
      } else {
        setApiError("An unexpected error occurred. Please try again.");
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
          <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">First-time sign-in</Text>
          <Text className="text-2xl font-extrabold leading-tight">Set your password</Text>
          <Text className="text-sm text-muted-foreground mt-2 leading-relaxed">
            You signed in with a temporary password from your landlord. Choose a new one to continue.
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 pb-6">
          <Field 
            label="Temporary password" 
            type="password" 
            secureTextEntry 
            placeholder="Enter temporary password" 
            icon={<Lock size={16} color="gray" />} 
            value={current} 
            onChangeText={setCurrent} 
            error={errors.current} 
          />
          <Field 
            label="New password" 
            type="password" 
            secureTextEntry 
            placeholder="Choose a new password" 
            icon={<Lock size={16} color="gray" />} 
            value={next} 
            onChangeText={setNext} 
            error={errors.next} 
          />
          <Field 
            label="Confirm new password" 
            type="password" 
            secureTextEntry 
            placeholder="Re-enter new password" 
            icon={<Lock size={16} color="gray" />} 
            value={confirm} 
            onChangeText={setConfirm} 
            error={errors.confirm} 
          />

          <View className="rounded-xl border border-border bg-surface p-3.5 mb-4 mt-2">
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Password policy</Text>
            <View className="gap-1.5">
              {rules.map((r) => (
                <View key={r.label} className="flex-row items-center gap-2">
                  <View className={`h-4 w-4 rounded-full items-center justify-center ${r.ok ? "bg-[#2563eb]" : "bg-secondary"}`}>
                    <Check size={10} color={r.ok ? "#ffffff" : "gray"} />
                  </View>
                  <Text className={r.ok ? "text-foreground text-xs" : "text-muted-foreground text-xs"}>{r.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {apiError && (
            <View className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 mb-4">
              <Text className="text-xs text-destructive">{apiError}</Text>
            </View>
          )}

          <PrimaryButton variant="primary" onPress={submit} disabled={loading}>
            {loading ? "Setting password..." : "Set password & continue"}
          </PrimaryButton>
          <Text className="text-center text-[11px] text-muted-foreground mt-4">
            The temporary password will stop working after this step.
          </Text>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
