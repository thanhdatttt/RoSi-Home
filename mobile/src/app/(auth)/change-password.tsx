import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../components/MobileFrame";
import { Field } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ArrowLeft, Lock, Check } from "lucide-react-native";
import { useAuth } from "../../contexts/auth-context";
import { ApiRequestError } from "../../lib/api";

export default function ChangePassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    { label: "Different from current password", ok: next.length > 0 && next !== current },
  ];

  async function submit() {
    const errs: Record<string, string> = {};
    if (!current) errs.current = "Enter your current password";
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
      router.push("/profile");
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
          setApiError(e.message || "Failed to change password.");
        }
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    }
  }

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: Math.max(insets.top + 16, 56) }}>
          <Link href="/profile" asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Security</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>Change password</Text>
          </View>
        </View>

        {/* Form */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 24) }}>
          <Field 
            label="Current password" 
            secureTextEntry 
            placeholder="Enter current password" 
            icon={<Lock size={16} color="gray" />} 
            value={current} 
            onChangeText={setCurrent} 
            error={errors.current} 
          />
          <View style={{ marginTop: 16 }}>
            <Field 
              label="New password" 
              secureTextEntry 
              placeholder="Choose a new password" 
              icon={<Lock size={16} color="gray" />} 
              value={next} 
              onChangeText={setNext} 
              error={errors.next} 
            />
          </View>
          <View style={{ marginTop: 16 }}>
            <Field 
              label="Confirm new password" 
              secureTextEntry 
              placeholder="Re-enter new password" 
              icon={<Lock size={16} color="gray" />} 
              value={confirm} 
              onChangeText={setConfirm} 
              error={errors.confirm} 
            />
          </View>

          {/* Policy checklist */}
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 14, marginTop: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 8 }}>Password policy</Text>
            <View style={{ gap: 6 }}>
              {rules.map((r) => (
                <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ height: 16, width: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: r.ok ? '#2563eb' : '#f1f5f9' }}>
                    <Check size={10} color={r.ok ? "#ffffff" : "gray"} />
                  </View>
                  <Text style={{ fontSize: 12, color: r.ok ? '#0f172a' : '#94a3b8' }}>{r.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {apiError && (
            <View style={{ borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#ef4444' }}>{apiError}</Text>
            </View>
          )}

          <PrimaryButton variant="primary" onPress={submit} disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </PrimaryButton>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
