import React, { type ReactNode } from "react";
import { SafeAreaView, View, Platform, ViewStyle } from "react-native";
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
    <SafeAreaView 
      className="flex-1 bg-background"
      style={webStyle}
    >
      <View className="flex-1">
        {children}
      </View>
    </SafeAreaView>
  );
}
