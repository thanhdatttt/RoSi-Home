import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MobileFrame } from "../components/MobileFrame";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { Home, KeyRound } from "lucide-react-native";

export default function Welcome() {
  return (
    <MobileFrame>
      {/* 
        Note: We use expo-linear-gradient for the background gradient.
        You may need to run `npx expo install expo-linear-gradient`.
        React Native doesn't natively support CSS blur for background orbs like 'blur-3xl'.
        Usually, this is achieved by using a PNG with a blur or react-native-svg with a radial gradient.
        We've left the blobs as colored views, but they won't be blurred. 
      */}
      <LinearGradient
        colors={['#073F28', '#022114', '#01170E']} /* Approximations of the oklch colors */
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={{ flex: 1, overflow: 'hidden' }}>
        {/* Background Orbs with blur */}
        <View style={{
          position: 'absolute', top: -96, right: -64,
          height: 256, width: 256, borderRadius: 128,
          backgroundColor: 'rgba(95, 216, 168, 0.25)',
          // Simulate blur with shadow on web
          shadowColor: '#5FD8A8', shadowRadius: 80, shadowOpacity: 0.4,
          elevation: 0,
        }} />
        <View style={{
          position: 'absolute', bottom: 128, left: -80,
          height: 256, width: 256, borderRadius: 128,
          backgroundColor: 'rgba(95, 216, 168, 0.12)',
          shadowColor: '#5FD8A8', shadowRadius: 80, shadowOpacity: 0.3,
          elevation: 0,
        }} />

        <View className="flex-1 flex-col px-7 pt-16">
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 rounded-xl bg-[#5FD8A8] items-center justify-center">
              <Home size={20} color="#022A1A" />
            </View>
            <Text className="font-bold tracking-tight text-lg text-white">RosiHome</Text>
          </View>

          <View className="mt-auto mb-10">
            <Text className="text-[#5FD8A8] text-xs uppercase tracking-[4px] mb-4">Rentals, simplified</Text>
            <Text className="font-extrabold text-[38px] leading-[40px] text-white">
              Manage rentals from your pocket.
            </Text>
            <Text style={{ marginTop: 16, fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 22 }}>
              Landlords run properties end-to-end. Tenants get a clean view of payments, repairs and documents — via an account their landlord sets up.
            </Text>
          </View>
        </View>

        <View style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingHorizontal: 28,
          paddingTop: 28,
          paddingBottom: 32,
          gap: 12,
        }}>
          <Link href="/register" asChild>
            <PrimaryButton variant="mint">
              Create landlord account
            </PrimaryButton>
          </Link>
          
          <Link href="/login" asChild>
            <PrimaryButton variant="outline">
              <View className="flex-row items-center justify-center gap-2">
                <KeyRound size={16} color="black" />
                <Text style={{ color: '#0b3b2e', fontWeight: '600', fontSize: 14 }}>Sign in</Text>
              </View>
            </PrimaryButton>
          </Link>

          <Text style={{ textAlign: 'center', fontSize: 11, color: '#5a7d6e', paddingTop: 4 }}>
            Tenants: use the credentials sent by your landlord.
          </Text>
        </View>
      </View>
    </MobileFrame>
  );
}
