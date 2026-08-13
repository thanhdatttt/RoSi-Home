import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  apiRequest,
  clearApiSession,
  configureApiSession,
  setOnSessionExpired,
  setOnTokenRefreshed,
  Storage,
  TOKEN_KEY,
  REFRESH_KEY,
  USER_KEY,
} from '@/lib/api';

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
  register: (data: RegisterInput) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function clearLocalSession() {
    clearApiSession();
    await Promise.all([
      Storage.deleteItemAsync(TOKEN_KEY),
      Storage.deleteItemAsync(REFRESH_KEY),
      Storage.deleteItemAsync(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  }

  async function refreshProfile() {
    if (!token) return;
    try {
      const me = await apiRequest<any>('/profile', { token });
      setUser((prev) => prev ? { ...prev, ...me } : prev);
    } catch (err) {
      console.error("Failed to refresh profile", err);
    }
  }

  // Restore a persisted session on cold start.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedToken, storedRefreshToken, storedUserJson] = await Promise.all([
        Storage.getItemAsync(TOKEN_KEY),
        Storage.getItemAsync(REFRESH_KEY),
        Storage.getItemAsync(USER_KEY),
      ]);
      if (storedToken && storedRefreshToken && storedUserJson && !cancelled) {
        configureApiSession(storedRefreshToken, true);
        setToken(storedToken);
        try {
          const storedUser = JSON.parse(storedUserJson) as AuthUser;
          const me = await apiRequest<any>('/profile', { token: storedToken });
          if (!cancelled) setUser({ ...storedUser, ...me });
        } catch {
          await clearLocalSession();
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Globally intercept 401 Unauthorized errors to automatically log the user out
  useEffect(() => {
    setOnTokenRefreshed((newToken) => {
      setToken(newToken);
    });
    setOnSessionExpired(() => {
      void clearLocalSession();
    });
    return () => {
      setOnTokenRefreshed(null);
      setOnSessionExpired(null);
    };
  }, []);

  async function login(username: string, password: string, rememberMe: boolean = false) {
    setLoading(true);
    try {
      const result = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      configureApiSession(result.refreshToken, rememberMe);
      if (rememberMe) {
        await Promise.all([
          Storage.setItemAsync(TOKEN_KEY, result.accessToken),
          Storage.setItemAsync(REFRESH_KEY, result.refreshToken),
          Storage.setItemAsync(USER_KEY, JSON.stringify(result.user)),
        ]);
      } else {
        await Promise.all([
          Storage.deleteItemAsync(TOKEN_KEY),
          Storage.deleteItemAsync(REFRESH_KEY),
          Storage.deleteItemAsync(USER_KEY),
        ]);
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

  async function register(data: RegisterInput) {
    setLoading(true);
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: data,
      });
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
      await clearLocalSession();
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
      await clearLocalSession();
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
