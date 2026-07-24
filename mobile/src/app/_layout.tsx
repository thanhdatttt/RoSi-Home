import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/contexts/auth-context';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

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
        if (user.role === 'Landlord' && currentPath === 'tenant') {
          router.replace('/landlord');
        } else if (user.role === 'Tenant' && currentPath === 'landlord') {
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(dashboard)" />
          </Stack>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}
