import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { MobileFrame } from "../../components/MobileFrame";
import { Field } from "../../components/ui/Field";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { ArrowLeft, Mail } from "lucide-react-native";

export default function Forgot() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  function submit() {
    router.push("/reset-sent");
  }

  return (
    <MobileFrame>
      <View className="flex-1 flex-col bg-background">
        <View className="px-6 pt-14 pb-4 flex-row items-center gap-3">
          <Link href="/login" asChild>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
              <ArrowLeft size={16} color="black" />
            </TouchableOpacity>
          </Link>
        </View>

        <View className="px-6 pb-4">
          <View className="h-14 w-14 rounded-2xl bg-[#2563eb]/15 items-center justify-center mb-4">
            <Mail size={24} color="black" />
          </View>
          <Text className="text-2xl font-extrabold">Forgot password?</Text>
          <Text className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Enter the email linked to your RosiHome account. If it matches an account, we'll send a time-limited reset link — we won't confirm either way for security.
          </Text>
        </View>

        <View className="flex-1 px-6 pb-6">
          <Field 
            label="Email address" 
            placeholder="you@email.com" 
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={16} color="gray" />} 
            value={email} 
            onChangeText={setEmail} 
          />
          <View className="mb-4" />
          <PrimaryButton variant="primary" onPress={submit}>
            Send reset link
          </PrimaryButton>
          
          <View className="flex-row justify-center items-center gap-1 mt-4">
            <Text className="text-xs text-muted-foreground">Remembered it?</Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-semibold text-xs underline">Back to sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </MobileFrame>
  );
}
