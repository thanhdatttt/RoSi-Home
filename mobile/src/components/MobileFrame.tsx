import React, { type ReactNode } from "react";
import { SafeAreaView, View, StyleSheet, Platform } from "react-native";

/**
 * MobileFrame acts as a SafeArea container for React Native.
 * On web, it constrained the size, but in a real mobile app,
 * we just want it to take up the full screen and respect safe areas.
 */
export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'var(--background)',
    // If we're on the web, constrain the layout to look like a mobile frame
    ...(Platform.OS === 'web' && {
      maxWidth: 440,
      width: '100%',
      marginHorizontal: 'auto',
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: 'var(--border)',
      minHeight: '100vh',
    }),
  },
  inner: {
    flex: 1,
  }
});
