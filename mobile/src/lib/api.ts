import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

export const Storage = {
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

export const TOKEN_KEY = 'rosihome.accessToken';
export const REFRESH_KEY = 'rosihome.refreshToken';

// Base URL of the RosiHome backend. Point this at your dev machine's LAN
// address (e.g. http://192.168.1.20:3000) when testing on a physical device,
// since `localhost` inside the Expo app resolves to the phone, not your laptop.
const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.API_BASE_URL ??
  'http://localhost:3000';

export type ApiRequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
};

export type ApiErrorPayload = {
  error?: { code?: string; message?: string; fields?: { field: string; message: string }[] };
};

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  fields?: { field: string; message: string }[];

  constructor(
    status: number,
    message: string,
    payload?: ApiErrorPayload,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = payload?.error?.code;
    this.fields = payload?.error?.fields;
  }
}

type ErrorInterceptor = (error: ApiRequestError) => void;
const interceptors: ErrorInterceptor[] = [];

export function onApiError(handler: ErrorInterceptor) {
  interceptors.push(handler);
  return () => {
    const idx = interceptors.indexOf(handler);
    if (idx > -1) interceptors.splice(idx, 1);
  };
}

let onTokenRefreshedCallback: ((newToken: string) => void) | null = null;
export function setOnTokenRefreshed(cb: ((newToken: string) => void) | null) {
  onTokenRefreshedCallback = cb;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshTokens(): Promise<string | null> {
  const refreshToken = await Storage.getItemAsync(REFRESH_KEY);
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await Storage.deleteItemAsync(TOKEN_KEY);
      await Storage.deleteItemAsync(REFRESH_KEY);
      return null;
    }

    const json = await res.json();
    const newAccess = json.data.accessToken;
    const newRefresh = json.data.refreshToken;
    
    await Storage.setItemAsync(TOKEN_KEY, newAccess);
    await Storage.setItemAsync(REFRESH_KEY, newRefresh);
    
    if (onTokenRefreshedCallback) {
      onTokenRefreshedCallback(newAccess);
    }
    
    return newAccess;
  } catch (err) {
    return null;
  }
}

/**
 * Thin fetch wrapper around the RosiHome REST API. Resolves to the `data`
 * field of the standard success envelope (`{ data: ... }`, or `{ data, meta }`
 * for lists). Throws `ApiRequestError` on non-2xx responses.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = 'GET', token, body, headers = {} } = options;

  const finalHeaders: Record<string, string> = { ...headers };
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  let res = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokens().then(newToken => {
        isRefreshing = false;
        if (newToken) {
          onRefreshed(newToken);
        } else {
          // If refresh failed, notify subscribers with empty token to trigger 401 error
          onRefreshed("");
        }
      });
    }

    const newToken = await new Promise<string>((resolve) => {
      refreshSubscribers.push(resolve);
    });

    if (newToken) {
      finalHeaders.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE_URL}/api/v1${path}`, {
        method,
        headers: finalHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    }
  }

  const text = await res.text();
  const json = text ? (JSON.parse(text) as Record<string, unknown> & ApiErrorPayload) : {};

  if (!res.ok) {
    const errPayload = json as ApiErrorPayload;
    const message =
      errPayload.error?.message ?? `Request failed with status ${res.status}`;
    const err = new ApiRequestError(res.status, message, errPayload);
    
    // Notify global interceptors (like AuthProvider for auto-logout)
    interceptors.forEach((fn) => fn(err));
    
    throw err;
  }

  return json.data as T;
}

export const API_BASE = API_BASE_URL;
