import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useTheme } from '@/hooks/use-theme';

function Button({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [pressed && !disabled && styles.pressed]}>
      <ThemedView type="backgroundElement" style={[styles.button, disabled && styles.buttonDisabled]}>
        <ThemedText type="link">{title}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export default function PushTestScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const auth = useAuth();
  const push = usePushNotifications(auth.token);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  async function handleLogin() {
    setLoginError(null);
    try {
      await auth.login(username, password);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed.');
    }
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom + BottomTabInset + Spacing.three },
      ]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Push notifications</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            Log in, register this device for Expo push, then send yourself a test notification.
            Remote push requires a development build — it will not work in Expo Go on Android, and
            needs a physical device (not a simulator).
          </ThemedText>
        </ThemedView>

        {!auth.user ? (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Log in</ThemedText>
            <TextInput
              placeholder="Phone (tenant) or email (landlord)"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
            {loginError && (
              <ThemedText type="small" themeColor="text" style={styles.errorText}>
                {loginError}
              </ThemedText>
            )}
            <Button title={auth.loading ? 'Logging in…' : 'Log in'} onPress={handleLogin} disabled={auth.loading} />
          </ThemedView>
        ) : (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">
              Logged in as {auth.user.role} ({auth.user.id.slice(0, 8)}…)
            </ThemedText>
            <Button title="Log out" onPress={auth.logout} />
          </ThemedView>
        )}

        {auth.user && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Device registration</ThemedText>
            <Button
              title={push.status.state === 'registering' ? 'Registering…' : 'Register this device for push'}
              onPress={push.registerForPushNotifications}
              disabled={push.status.state === 'registering'}
            />
            {push.status.state === 'registering' && <ActivityIndicator />}
            {push.status.state === 'registered' && (
              <ThemedText type="small" themeColor="textSecondary">
                Registered: {push.status.expoPushToken}
              </ThemedText>
            )}
            {push.status.state === 'error' && (
              <ThemedText type="small" style={styles.errorText}>
                {push.status.message}
              </ThemedText>
            )}

            {push.status.state === 'registered' && (
              <Button title="Send test notification" onPress={() => void push.sendTestPush()} />
            )}
          </ThemedView>
        )}

        {push.lastNotification && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Last notification received</ThemedText>
            <ThemedText type="small">{push.lastNotification.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {push.lastNotification.body}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              at {push.lastNotification.receivedAt}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.four,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  errorText: {
    color: '#d1453b',
  },
});
