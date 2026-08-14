import React, { type ReactNode } from "react";
import { View, Platform } from "react-native";
import { usePathname } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { RoleBottomNav } from "@/components/RoleBottomNav";

/**
 * MobileFrame acts as a SafeArea container for React Native.
 */
export function MobileFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Enforce rigid styles on web to simulate a mobile screen
  const webStyle = Platform.OS === 'web' ? {
    maxWidth: 440,
    width: '100%',
    marginHorizontal: 'auto',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0', // standard tailwind border color
    minHeight: '100vh',
  } as any : {};

  return (
    <View style={[{ flex: 1, backgroundColor: '#f5f8ff' }, webStyle]}>
      {children}
      <RoleBottomNav pathname={pathname} role={user?.role} />
    </View>
  );
}
