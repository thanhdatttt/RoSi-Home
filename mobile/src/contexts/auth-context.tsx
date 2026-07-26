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
  fullName?: string;
  email?: string;
  phone?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  register: (data: any) => Promise<AuthUser>;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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

  async function refreshProfile() {
    if (!token) return;
    try {
      const me = await apiRequest<any>('/profile', { token });
      setUser((prev) => prev ? { ...prev, ...me } : { ...me, mustChangePassword: false });
    } catch (err) {
      console.error("Failed to refresh profile", err);
    }
  }

  // Restore a persisted session on cold start.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storedToken = await Storage.getItemAsync(TOKEN_KEY);
      if (storedToken && !cancelled) {
        setToken(storedToken);
        try {
          const me = await apiRequest<any>('/profile', { token: storedToken });
          if (!cancelled) setUser({ ...me, mustChangePassword: false });
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

  async function login(username: string, password: string, rememberMe: boolean = false) {
    setLoading(true);
    try {
      const result = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      if (rememberMe) {
        await Storage.setItemAsync(TOKEN_KEY, result.accessToken);
        await Storage.setItemAsync(REFRESH_KEY, result.refreshToken);
      } else {
        // Do not persist session
        await Storage.deleteItemAsync(TOKEN_KEY);
        await Storage.deleteItemAsync(REFRESH_KEY);
      }
      setToken(result.accessToken);
      setUser(result.user);
      
      // Fetch full profile in background to populate fullName and email
      apiRequest<any>('/profile', { token: result.accessToken })
        .then(me => setUser(prev => prev ? { ...prev, ...me } : prev))
        .catch(err => console.error("Failed to fetch profile on login", err));
        
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
      // After successful registration, log them in immediately with persistent session
      return await login(data.email, data.password, true);
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
    () => ({ user, token, loading, login, register, forgotPassword, changePassword, logout, refreshProfile }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider.');
  return ctx;
}
