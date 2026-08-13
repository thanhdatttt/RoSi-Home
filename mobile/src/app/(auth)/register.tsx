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

export default function Register() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const insets = useSafeAreaInsets();

  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  function set(k: keyof typeof values, v: string) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function submit() {
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = "Full name is required";
    if (!values.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errs.email = "Enter a valid email";
    if (values.password.length < 8) errs.password = "Minimum 8 characters";
    if (!/[A-Za-z]/.test(values.password)) errs.password = "Must contain a letter";
    if (!/[0-9]/.test(values.password)) errs.password = "Must contain a number";
    if (values.confirm !== values.password) errs.confirm = "Passwords don't match";

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
          e.fields.forEach((f) => {
            if (f.field === 'fullName') fieldErrors.name = f.message;
            if (f.field === 'email') fieldErrors.email = f.message;
            if (f.field === 'password') fieldErrors.password = f.message;
            if (f.field === 'passwordConfirmation') fieldErrors.confirm = f.message;
          });
          setErrors(fieldErrors);
        } else {
          setApiError(e.message || "Registration failed. Please try again.");
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
          <Link href="/" asChild>
            <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
          <View>
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Landlord sign-up</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>Create your account</Text>
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
              This creates a <Text style={{ fontWeight: '700' }}>Landlord</Text> account. Tenant accounts are created by their landlord — tenants can't self-register.
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
          <View style={{ marginTop: 16 }}>
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
          </View>
          <View style={{ marginTop: 16 }}>
            <Field
              label="Password"
              secureTextEntry
              placeholder="At least 8 characters"
              icon={<Lock size={16} color="gray" />}
              value={values.password}
              onChangeText={(text) => set("password", text)}
              error={errors.password}
            />
          </View>
          <View style={{ marginTop: 16 }}>
            <Field
              label="Confirm password"
              secureTextEntry
              placeholder="Re-enter password"
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
              {loading ? "Creating account..." : "Create landlord account"}
            </PrimaryButton>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 16 }}>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>Already registered?</Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600', textDecorationLine: 'underline' }}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </View>
    </MobileFrame>
  );
}
