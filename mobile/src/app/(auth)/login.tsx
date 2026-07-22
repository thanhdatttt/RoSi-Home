import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { Link, useRouter } from "expo-router";
import { MobileFrame } from "../../components/MobileFrame";
import { Field } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ArrowLeft, Mail, Lock } from "lucide-react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  function submit() {
    if (!email || !password) {
      setErr("The email or password you entered is incorrect.");
      return;
    }
    setErr(null);
    if (email.toLowerCase().includes("temp")) {
      router.push("/force-change-password");
    } else if (email.toLowerCase().includes("tenant")) {
      router.push("/tenant");
    } else {
      router.push("/landlord");
    }
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
            <Text className="text-[11px] uppercase tracking-widest text-[#2563eb] font-semibold">Welcome back</Text>
            <Text className="text-2xl font-extrabold leading-tight">Sign in to RosiHome</Text>
          </View>
        </View>

        <View className="flex-1 px-6 pb-6">
          <Field 
            label="Email address" 
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@email.com" 
            icon={<Mail size={16} color="gray" />} 
            value={email} 
            onChangeText={setEmail} 
          />
          <Field 
            label="Password" 
            secureTextEntry 
            placeholder="Your password" 
            icon={<Lock size={16} color="gray" />} 
            value={password} 
            onChangeText={setPassword} 
          />

          <View className="flex-row items-center justify-between text-xs mb-4">
            <View className="flex-row items-center gap-2">
              <Switch 
                value={rememberMe} 
                onValueChange={setRememberMe}
                trackColor={{ true: "#2563eb", false: "#ccc" }}
              />
              <Text className="text-muted-foreground text-xs">Remember me</Text>
            </View>
            <Link href="/forgot-password" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-semibold text-xs">Forgot password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {err && (
            <View className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 mb-4">
              <Text className="text-xs text-destructive">{err}</Text>
            </View>
          )}

          <PrimaryButton variant="primary" onPress={submit}>
            Sign in
          </PrimaryButton>

          <View className="pt-4 flex-row justify-center items-center gap-1">
            <Text className="text-xs text-muted-foreground">Landlord?</Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-semibold text-xs underline">Create account</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <Text className="text-center text-[11px] text-muted-foreground mt-2">
            Tenants: your landlord sets up your account and sends a temporary password.
          </Text>
        </View>
      </View>
    </MobileFrame>
  );
}
