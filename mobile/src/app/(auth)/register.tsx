import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { MobileFrame } from "../../components/MobileFrame";
import { Field } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ArrowLeft, Mail, Lock, User, Building2 } from "lucide-react-native";

export default function Register() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(k: keyof typeof values, v: string) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function submit() {
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = "Full name is required";
    if (!values.email.trim()) errs.email = "Email is required";
    else if (!/^\\S+@\\S+\\.\\S+$/.test(values.email)) errs.email = "Enter a valid email";
    if (values.password.length < 8) errs.password = "Minimum 8 characters";
    if (values.confirm !== values.password) errs.confirm = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    router.push("/landlord");
  }

  return (
    <MobileFrame>
      <View className="flex-1 flex-col bg-background">
        <View className="px-6 pt-14 pb-4 flex-row items-center gap-3">
          <Link href="/" asChild>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View>
            <Text className="text-[11px] uppercase tracking-widest text-[#5FD8A8] font-semibold">Landlord sign-up</Text>
            <Text className="text-2xl font-extrabold leading-tight">Create your account</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pb-6">
          <View className="rounded-xl border border-[#5FD8A8]/40 bg-[#5FD8A8]/10 p-3.5 flex-row items-start gap-3 mb-4">
            <View className="h-9 w-9 rounded-lg bg-[#5FD8A8] items-center justify-center shrink-0">
              <Building2 size={16} color="#022A1A" />
            </View>
            <Text className="text-xs text-foreground/80 leading-relaxed flex-1">
              This creates a <Text className="font-bold">Landlord</Text> account. Tenant accounts are created by their landlord — tenants can't self-register.
            </Text>
          </View>

          <Field 
            label="Full name" 
            placeholder="Amelia Osei" 
            icon={<User size={16} color="gray" />} 
            value={values.name} 
            onChangeText={(text) => set("name", text)} 
            error={errors.name} 
          />
          <Field 
            label="Email address" 
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@email.com" 
            icon={<Mail size={16} color="gray" />} 
            value={values.email} 
            onChangeText={(text) => set("email", text)} 
            error={errors.email} 
            hint="Used as your unique login identifier" 
          />
          <Field 
            label="Password" 
            secureTextEntry 
            placeholder="At least 8 characters" 
            icon={<Lock size={16} color="gray" />} 
            value={values.password} 
            onChangeText={(text) => set("password", text)} 
            error={errors.password} 
          />
          <Field 
            label="Confirm password" 
            secureTextEntry 
            placeholder="Re-enter password" 
            icon={<Lock size={16} color="gray" />} 
            value={values.confirm} 
            onChangeText={(text) => set("confirm", text)} 
            error={errors.confirm} 
          />

          <View className="pt-2">
            <PrimaryButton variant="mint" onPress={submit}>
              Create landlord account
            </PrimaryButton>
          </View>
          
          <View className="flex-row justify-center items-center gap-1 mt-4">
            <Text className="text-xs text-muted-foreground">Already registered?</Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-semibold text-xs underline">Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
