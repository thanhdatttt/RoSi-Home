import React, { type ReactNode } from "react";
import { View, Platform, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";

/**
 * MobileFrame acts as a SafeArea container for React Native.
 */
export function MobileFrame({ children }: { children: ReactNode }) {
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
    </View>
  );
}
