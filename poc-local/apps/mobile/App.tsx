import { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { AuthenticatedUser } from "./src/api/client";
import { LoginScreen } from "./src/screens/LoginScreen";
import { PropertiesScreen } from "./src/screens/PropertiesScreen";
import { colors } from "./src/theme";

interface Session {
  token: string;
  user: AuthenticatedUser;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="dark" />
      {session ? (
        <PropertiesScreen
          onLogout={() => setSession(null)}
          token={session.token}
          user={session.user}
        />
      ) : (
        <LoginScreen onAuthenticated={setSession} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
