import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export { ErrorBoundary } from 'expo-router';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { openNotificationLink } from '@/features/notifications/routing';
import { I18nProvider } from '@/i18n/I18nProvider';

const supportsNativeNotifications = Platform.OS === 'ios' || Platform.OS === 'android';

if (supportsNativeNotifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!user || !supportsNativeNotifications) return;
    const openResponse = (response: Notifications.NotificationResponse | null) => {
      const linkRef = response?.notification.request.content.data?.linkRef;
      if (typeof linkRef === 'string') openNotificationLink(router, user, linkRef);
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(openResponse);
    void Notifications.getLastNotificationResponseAsync().then(openResponse);
    return () => subscription.remove();
  }, [router, user]);

  useEffect(() => {
    if (loading) return;

    const currentSegments = segments as string[];
    const currentPath = currentSegments[currentSegments.length - 1];
    const isIndex = currentSegments.length === 0 || currentSegments[0] === 'index';
    const allowedUnauthPaths = ['login', 'register', 'forgot-password', 'reset-sent'];

    const isAllowedUnauth = isIndex || (currentPath && allowedUnauthPaths.includes(currentPath));

    if (!user && !isAllowedUnauth) {
      router.replace('/login');
    } else if (user) {
      const isAuthScreen = isIndex || (currentPath && allowedUnauthPaths.includes(currentPath));

      // If user MUST change password, strictly restrict them to the force-change-password screen
      if (user.mustChangePassword && currentPath !== 'force-change-password') {
        router.replace('/force-change-password');
        return;
      }

      if (isAuthScreen) {
        // Redirect authenticated users away from login/register screens
        if (user.mustChangePassword) {
          router.replace('/force-change-password');
        } else if (user.role === 'Tenant') {
          router.replace('/tenant');
        } else {
          router.replace('/landlord');
        }
      } else if (!user.mustChangePassword) {
        // Strictly prevent cross-role access to dashboards
        const isTenantArea = currentSegments.includes('tenant');
        const isLandlordArea = currentSegments.includes('landlord');
        if (user.role === 'Landlord' && isTenantArea) {
          router.replace('/landlord');
        } else if (user.role === 'Tenant' && isLandlordArea) {
          router.replace('/tenant');
        }
      }
    }
  }, [user, loading, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <I18nProvider>
          <AuthProvider>
            <AuthGuard>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(dashboard)" />
              </Stack>
            </AuthGuard>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
