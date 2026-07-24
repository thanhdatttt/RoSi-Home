import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { TokenProvider } from './auth';
import { FetchApiClient, ApiClient } from './client';
import { API_BASE_URL } from './config';
import { ApiEnvelope, ApiError } from './types';

export type AuthUser = {
  id: string;
  role: 'Landlord' | 'Tenant';
  mustChangePassword: boolean;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type ApiSessionContextValue = {
  enabled: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  client: ApiClient;
  login(username: string, password: string): Promise<AuthUser>;
  register(input: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  logout(): Promise<void>;
};

const ApiSessionContext = createContext<ApiSessionContextValue | null>(null);

export function ApiSessionProvider({ children }: PropsWithChildren) {
  const enabled = Boolean(API_BASE_URL);
  const [tokens, setTokens] = useState<TokenPair | null>(null);
  const tokensRef = useRef<TokenPair | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const updateTokens = useCallback((next: TokenPair | null) => {
    tokensRef.current = next;
    setTokens(next);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (!API_BASE_URL || !tokensRef.current?.refreshToken) return null;
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: tokensRef.current?.refreshToken,
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | ApiEnvelope<TokenPair>
          | null;
        if (!response.ok || !payload?.data) {
          updateTokens(null);
          return null;
        }
        updateTokens(payload.data);
        return payload.data.accessToken;
      } catch {
        updateTokens(null);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [updateTokens]);

  const tokenProvider = useMemo<TokenProvider>(
    () => ({
      getAccessToken: async () => tokensRef.current?.accessToken ?? null,
      getRefreshToken: async () => tokensRef.current?.refreshToken ?? null,
      refreshAccessToken,
      handleUnauthorized: async () => updateTokens(null),
    }),
    [refreshAccessToken, updateTokens],
  );

  const client = useMemo(
    () => new FetchApiClient(API_BASE_URL, tokenProvider),
    [tokenProvider],
  );

  const login = useCallback(
    async (username: string, password: string) => {
      if (!enabled) {
        const mockSession: TokenPair = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: 'mock-landlord',
            role: 'Landlord',
            mustChangePassword: false,
          },
        };
        updateTokens(mockSession);
        return mockSession.user;
      }

      const response = await client.request<ApiEnvelope<TokenPair>>({
        method: 'POST',
        path: '/api/v1/auth/login',
        body: { username, password },
        authenticated: false,
      });
      updateTokens(response.data);
      return response.data.user;
    },
    [client, enabled, updateTokens],
  );

  const register = useCallback(
    async (input: { fullName: string; email: string; password: string }) => {
      if (!enabled) return;
      await client.request({
        method: 'POST',
        path: '/api/v1/auth/register',
        body: {
          ...input,
          passwordConfirmation: input.password,
        },
        authenticated: false,
      });
    },
    [client, enabled],
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      if (!enabled) return;
      await client.request({
        method: 'POST',
        path: '/api/v1/auth/forgot-password',
        body: { email },
        authenticated: false,
      });
    },
    [client, enabled],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!enabled) return;
      await client.request({
        method: 'POST',
        path: '/api/v1/auth/change-password',
        body: {
          currentPassword,
          newPassword,
          newPasswordConfirmation: newPassword,
        },
      });
      const refreshedToken = await refreshAccessToken();
      if (!refreshedToken) {
        throw new ApiError(
          'Mật khẩu đã đổi nhưng phiên đăng nhập không thể làm mới. Vui lòng đăng nhập lại.',
          'unauthorized',
        );
      }
    },
    [client, enabled, refreshAccessToken],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokensRef.current?.refreshToken;
    try {
      if (enabled && tokensRef.current) {
        await client.request({
          method: 'POST',
          path: '/api/v1/auth/logout',
          body: { refreshToken },
        });
      }
    } finally {
      updateTokens(null);
    }
  }, [client, enabled, updateTokens]);

  const value = useMemo<ApiSessionContextValue>(
    () => ({
      enabled,
      authenticated: Boolean(tokens),
      user: tokens?.user ?? null,
      client,
      login,
      register,
      forgotPassword,
      changePassword,
      logout,
    }),
    [
      changePassword,
      client,
      enabled,
      forgotPassword,
      login,
      logout,
      register,
      tokens,
    ],
  );

  return (
    <ApiSessionContext.Provider value={value}>
      {children}
    </ApiSessionContext.Provider>
  );
}

export function useApiSession() {
  const value = useContext(ApiSessionContext);
  if (!value) {
    throw new ApiError(
      'ApiSessionProvider chưa được cấu hình.',
      'configuration',
    );
  }
  return value;
}
