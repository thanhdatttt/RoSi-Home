import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { apiRequest } from '@/lib/api';

export type AuthUser = {
  id: string;
  role: 'Landlord' | 'Tenant';
  mustChangePassword: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'rosihome.accessToken';
const REFRESH_KEY = 'rosihome.refreshToken';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Restore a persisted session on cold start.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken && !cancelled) {
        setToken(storedToken);
        // The API exposes the current user via GET /profile; for the push
        // test screen we only need the token + a lightweight user object.
        try {
          const me = await apiRequest<{ id: string; role: AuthUser['role']; mustChangePassword: boolean }>(
            '/profile',
            { token: storedToken },
          );
          if (!cancelled) setUser(me);
        } catch {
          // Stored token is no longer valid — drop it.
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          if (!cancelled) setToken(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(username: string, password: string) {
    setLoading(true);
    try {
      const result = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      await SecureStore.setItemAsync(TOKEN_KEY, result.accessToken);
      await SecureStore.setItemAsync(REFRESH_KEY, result.refreshToken);
      setToken(result.accessToken);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      if (token) {
        const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
        await apiRequest('/auth/logout', {
          method: 'POST',
          token,
          body: refresh ? { refreshToken: refresh } : {},
        });
      }
    } catch {
      // Best-effort server logout; always clear local state.
    } finally {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_KEY);
      setToken(null);
      setUser(null);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider.');
  return ctx;
}
