import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { MobileFrame } from "../../components/MobileFrame";
import { Field } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ArrowLeft, Lock, Check } from "lucide-react-native";

export default function ChangePassword() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rules = [
    { label: "At least 8 characters", ok: next.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(next) },
    { label: "One number", ok: /\\d/.test(next) },
    { label: "Different from current password", ok: next.length > 0 && next !== current },
  ];

  function submit() {
    const errs: Record<string, string> = {};
    if (!current) errs.current = "Enter your current password";
    if (!rules.every((r) => r.ok)) errs.next = "Password doesn't meet the policy";
    if (confirm !== next) errs.confirm = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    router.push("/profile");
  }

  return (
    <MobileFrame>
      <View className="flex-1 flex-col bg-background pb-8">
        <View className="px-6 pt-14 pb-4 flex-row items-center gap-3">
          <Link href="/profile" asChild>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View>
            <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">Security</Text>
            <Text className="text-2xl font-extrabold leading-tight">Change password</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pb-6">
          <Field 
            label="Current password" 
            type="password" 
            secureTextEntry 
            placeholder="Enter current password" 
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

          <View className="rounded-xl border border-border bg-surface p-3.5 mb-4">
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

          <PrimaryButton variant="primary" onPress={submit}>
            Update password
          </PrimaryButton>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
