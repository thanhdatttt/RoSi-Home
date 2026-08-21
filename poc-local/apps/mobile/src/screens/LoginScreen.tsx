import { useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { API_URL, errorMessage, login, type AuthenticatedUser } from "../api/client";
import { AppButton, Field, Notice, Panel } from "../components/ui";
import { colors } from "../theme";

interface LoginScreenProps {
  onAuthenticated: (session: { token: string; user: AuthenticatedUser }) => void;
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const { width } = useWindowDimensions();
  const compact = width < 840;
  const [email, setEmail] = useState("landlord-a@poc.local");
  const [password, setPassword] = useState("demo-password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      onAuthenticated(await login(email, password));
    } catch (loginError) {
      setError(errorMessage(loginError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.page, compact && styles.pageCompact]}>
      <View style={styles.intro}>
        <View style={styles.eyebrow}>
          <Text style={styles.eyebrowText}>LOCAL ARCHITECTURE POC</Text>
        </View>
        <Text style={[styles.title, compact && styles.titleCompact]}>
          Một luồng thật, chạy hoàn toàn trên máy bạn.
        </Text>
        <Text style={styles.subtitle}>
          Expo/React Native gọi Express API, JWT bảo vệ tài nguyên và PGlite lưu
          dữ liệu qua mỗi lần khởi động lại.
        </Text>
        <View style={styles.flow}>
          {[
            ["01", "Presentation", "Expo Web :8082"],
            ["02", "Application", "Express API :3100"],
            ["03", "Persistence", "Drizzle + PGlite"],
          ].map(([number, label, detail]) => (
            <View key={number} style={styles.flowItem}>
              <Text style={styles.flowNumber}>{number}</Text>
              <View>
                <Text style={styles.flowLabel}>{label}</Text>
                <Text style={styles.flowDetail}>{detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Panel style={styles.loginPanel}>
        <Text style={styles.panelKicker}>DEMO LANDLORD</Text>
        <Text style={styles.panelTitle}>Đăng nhập PoC</Text>
        <Text style={styles.panelDescription}>
          Tài khoản bên dưới là dữ liệu giả và đã được điền sẵn để demo.
        </Text>

        {error ? <Notice message={error} tone="error" /> : null}

        <Field
          autoCapitalize="none"
          label="Email"
          onChangeText={setEmail}
          placeholder="landlord-a@poc.local"
          value={email}
        />
        <Field
          label="Mật khẩu"
          onChangeText={setPassword}
          onSubmitEditing={submit}
          placeholder="demo-password"
          secureTextEntry
          value={password}
        />
        <AppButton label="Vào workspace" loading={loading} onPress={submit} />

        <View style={styles.endpoint}>
          <View style={styles.statusDot} />
          <Text numberOfLines={1} style={styles.endpointText}>
            API local: {API_URL}
          </Text>
        </View>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: "center",
    flexDirection: "row",
    gap: 56,
    justifyContent: "center",
    maxWidth: 1120,
    paddingHorizontal: 28,
    paddingVertical: 48,
    width: "100%",
  },
  pageCompact: {
    alignItems: "stretch",
    flexDirection: "column",
    gap: 32,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  intro: { flex: 1, gap: 18, maxWidth: 570 },
  eyebrow: {
    alignSelf: "flex-start",
    backgroundColor: colors.warmSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  eyebrowText: {
    color: "#7A5313",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    color: colors.ink,
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1.5,
    lineHeight: 55,
  },
  titleCompact: { fontSize: 36, letterSpacing: -1, lineHeight: 42 },
  subtitle: { color: colors.inkMuted, fontSize: 18, lineHeight: 29 },
  flow: { gap: 12, marginTop: 10 },
  flowItem: { alignItems: "center", flexDirection: "row", gap: 14 },
  flowNumber: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    width: 24,
  },
  flowLabel: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  flowDetail: { color: colors.inkMuted, fontSize: 13, marginTop: 2 },
  loginPanel: { gap: 18, maxWidth: 420, width: "100%" },
  panelKicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  panelTitle: { color: colors.ink, fontSize: 30, fontWeight: "800" },
  panelDescription: { color: colors.inkMuted, fontSize: 15, lineHeight: 22 },
  endpoint: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingTop: 16,
  },
  statusDot: {
    backgroundColor: colors.primary,
    borderRadius: 99,
    height: 8,
    width: 8,
  },
  endpointText: { color: colors.inkMuted, flex: 1, fontSize: 12 },
});
