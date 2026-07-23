import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

const Storage = {
  getItemAsync: async (key: string) => {
    if (isWeb) return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key: string, value: string) => {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  deleteItemAsync: async (key: string) => {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

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
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (data: any) => Promise<AuthUser>;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
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
      const storedToken = await Storage.getItemAsync(TOKEN_KEY);
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
          await Storage.deleteItemAsync(TOKEN_KEY);
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
      await Storage.setItemAsync(TOKEN_KEY, result.accessToken);
      await Storage.setItemAsync(REFRESH_KEY, result.refreshToken);
      setToken(result.accessToken);
      setUser(result.user);
      return result.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(data: any) {
    setLoading(true);
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: data,
      });
      // After successful registration, log them in immediately
      return await login(data.email, data.password);
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword(email: string) {
    setLoading(true);
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(data: any) {
    setLoading(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        token,
        body: data,
      });
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      if (token) {
        const refresh = await Storage.getItemAsync(REFRESH_KEY);
        await apiRequest('/auth/logout', {
          method: 'POST',
          token,
          body: refresh ? { refreshToken: refresh } : {},
        });
      }
    } catch {
      // Best-effort server logout; always clear local state.
    } finally {
      await Storage.deleteItemAsync(TOKEN_KEY);
      await Storage.deleteItemAsync(REFRESH_KEY);
      setToken(null);
      setUser(null);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, forgotPassword, changePassword, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider.');
  return ctx;
}
