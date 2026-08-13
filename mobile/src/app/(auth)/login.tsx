import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileFrame } from "../../components/MobileFrame";
import { Field } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ArrowLeft, Mail, Lock } from "lucide-react-native";
import { useAuth } from "../../contexts/auth-context";
import { ApiRequestError } from "../../lib/api";

export default function Login() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  async function submit() {
    if (!email || !password) {
      setErr("The email or password you entered is incorrect.");
      return;
    }
    setErr(null);
    try {
      const user = await login(email.trim(), password, rememberMe);
      if (user.mustChangePassword) {
        router.push("/force-change-password");
      } else if (user.role === 'Tenant') {
        router.push("/tenant");
      } else {
        router.push("/landlord");
      }
    } catch (e: any) {
      if (e instanceof ApiRequestError) {
        setErr(e.message || "Invalid credentials.");
      } else {
        setErr("An unexpected error occurred. Please try again.");
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
            <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#2563eb', fontWeight: '600' }}>Welcome back</Text>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>Sign in to RosiHome</Text>
          </View>
        </View>

        {/* Form */}
        <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 16, 24) }}>
          <Field
            label="Email or phone number"
            autoCapitalize="none"
            placeholder="you@email.com or phone"
            icon={<Mail size={16} color="gray" />}
            value={email}
            onChangeText={setEmail}
          />
          <View style={{ marginTop: 16 }}>
            <Field
              label="Password"
              secureTextEntry
              placeholder="Your password"
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
              <Text style={{ fontSize: 12, color: '#64748b' }}>Remember me</Text>
            </View>
            <Link href="/forgot-password" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600' }}>Forgot password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {err && (
            <View style={{ borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#ef4444' }}>{err}</Text>
            </View>
          )}

          <PrimaryButton variant="primary" onPress={submit} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </PrimaryButton>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 16 }}>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>No account yet?</Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600', textDecorationLine: 'underline' }}>Register as landlord</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </MobileFrame>
  );
}
