import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const Storage = {
  getItemAsync: async (key: string) => {
    if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
    return SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key: string, value: string) => {
    if (isWeb) {
      globalThis.localStorage?.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  deleteItemAsync: async (key: string) => {
    if (isWeb) {
      globalThis.localStorage?.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const TOKEN_KEY = 'rosihome.accessToken';
export const REFRESH_KEY = 'rosihome.refreshToken';
export const USER_KEY = 'rosihome.user';

const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined);

const API_BASE_URL = (configuredApiUrl ?? 'http://192.168.0.101:3000').replace(/\/$/, '');

export type ApiFieldError = { field: string; message: string };
export type ApiListMeta = { page: number; pageSize: number; total: number };
export type ApiEnvelope<T> = { data: T };
export type ApiListEnvelope<T> = { data: T[]; meta: ApiListMeta };

export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: unknown | FormData;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export type ApiErrorPayload = {
  error?: { code?: string; message?: string; fields?: ApiFieldError[] };
};

export type ApiErrorLanguage = 'en' | 'vi';

let apiErrorLanguage: ApiErrorLanguage = 'en';

export function setApiErrorLanguage(language: ApiErrorLanguage) {
  apiErrorLanguage = language;
}

function localizedApiErrorMessage(status: number, message: string, code?: string) {
  const vi = apiErrorLanguage === 'vi';

  if (status === 0 && message === 'Request timed out.') {
    return vi ? 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.' : 'Request timed out. Please try again.';
  }
  if (status === 0) {
    return vi ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.' : 'Unable to connect to the server. Check your network and try again.';
  }

  const knownMessages: Record<string, [string, string]> = {
    UNAUTHENTICATED: ['Your session has expired. Please sign in again.', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'],
    FORBIDDEN: ['You do not have permission to perform this action.', 'Bạn không có quyền thực hiện thao tác này.'],
    NOT_FOUND: ['The requested item could not be found.', 'Không tìm thấy thông tin bạn yêu cầu.'],
    INTERNAL_ERROR: ['The server encountered an error. Please try again later.', 'Máy chủ gặp lỗi. Vui lòng thử lại sau.'],
  };
  const known = code ? knownMessages[code] : undefined;
  if (known) return vi ? known[1] : known[0];
  
  if (message && message !== "Conflict" && message !== "Bad Request") {
    return message;
  }

  if (status >= 500) {
    return vi ? 'Máy chủ gặp lỗi. Vui lòng thử lại sau.' : 'The server encountered an error. Please try again later.';
  }
  return message;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fields?: ApiFieldError[];

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(localizedApiErrorMessage(status, message, payload?.error?.code));
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = payload?.error?.code;
    this.fields = payload?.error?.fields;
  }
}

type ErrorInterceptor = (error: ApiRequestError) => void;
const interceptors = new Set<ErrorInterceptor>();

export function onApiError(handler: ErrorInterceptor) {
  interceptors.add(handler);
  return () => {
    interceptors.delete(handler);
  };
}

let onTokenRefreshedCallback: ((newToken: string) => void) | null = null;
let onSessionExpiredCallback: (() => void) | null = null;

export function setOnTokenRefreshed(callback: ((newToken: string) => void) | null) {
  onTokenRefreshedCallback = callback;
}

export function setOnSessionExpired(callback: (() => void) | null) {
  onSessionExpiredCallback = callback;
}

let refreshPromise: Promise<string | null> | null = null;
let sessionRefreshToken: string | null = null;
let persistSession = false;

export function configureApiSession(refreshToken: string | null, persist: boolean) {
  sessionRefreshToken = refreshToken;
  persistSession = persist;
}

export function clearApiSession() {
  sessionRefreshToken = null;
  persistSession = false;
}

async function clearStoredSession() {
  await Promise.all([
    Storage.deleteItemAsync(TOKEN_KEY),
    Storage.deleteItemAsync(REFRESH_KEY),
    Storage.deleteItemAsync(USER_KEY),
  ]);
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const storedRefreshToken = await Storage.getItemAsync(REFRESH_KEY);
    const refreshToken = sessionRefreshToken ?? storedRefreshToken;
    if (!refreshToken) return null;

    if (!sessionRefreshToken && storedRefreshToken) {
      sessionRefreshToken = storedRefreshToken;
      persistSession = true;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await clearStoredSession();
        clearApiSession();
        return null;
      }

      const envelope = (await response.json()) as ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
      }>;
      const { accessToken, refreshToken: rotatedRefreshToken } = envelope.data;

      sessionRefreshToken = rotatedRefreshToken;
      if (persistSession) {
        await Promise.all([
          Storage.setItemAsync(TOKEN_KEY, accessToken),
          Storage.setItemAsync(REFRESH_KEY, rotatedRefreshToken),
        ]);
      }
      onTokenRefreshedCallback?.(accessToken);
      return accessToken;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function makeBody(body: ApiRequestOptions['body']): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (isFormData(body)) return body;
  return JSON.stringify(body);
}

function makeHeaders(
  body: ApiRequestOptions['body'],
  token: string | null | undefined,
  headers: Record<string, string>,
) {
  return {
    Accept: 'application/json',
    ...(body === undefined || isFormData(body) ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRequestError(0, 'Request timed out.');
    }
    throw new ApiRequestError(0, 'Unable to connect to the server.');
  } finally {
    clearTimeout(timeout);
  }
}

async function requestResponse(
  path: string,
  options: ApiRequestOptions,
  allowRefresh = true,
): Promise<Response> {
  const {
    method = 'GET',
    token,
    body,
    headers = {},
    timeoutMs = 15_000,
  } = options;
  const url = `${API_BASE_URL}/api/v1${path}`;
  const init: RequestInit = {
    method,
    headers: makeHeaders(body, token, headers),
    body: makeBody(body),
  };

  let response = await fetchWithTimeout(url, init, timeoutMs);

  if (response.status === 401 && token && allowRefresh) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      response = await requestResponse(
        path,
        { ...options, token: refreshedToken },
        false,
      );
    } else {
      onSessionExpiredCallback?.();
    }
  }

  return response;
}

async function readJson(response: Response): Promise<Record<string, unknown> & ApiErrorPayload> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown> & ApiErrorPayload;
  } catch {
    throw new ApiRequestError(response.status, 'The server returned an invalid response.');
  }
}

function throwApiError(response: Response, payload: ApiErrorPayload): never {
  const error = new ApiRequestError(
    response.status,
    payload.error?.message ?? `Request failed with status ${response.status}`,
    payload,
  );
  interceptors.forEach((handler) => handler(error));
  throw error;
}

export async function apiRequestWithEnvelope<T = unknown, M = ApiListMeta>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<{ data: T; meta?: M }> {
  const response = await requestResponse(path, options);
  const payload = await readJson(response);
  if (!response.ok) throwApiError(response, payload);
  return payload as { data: T; meta?: M };
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const envelope = await apiRequestWithEnvelope<T>(path, options);
  return envelope.data;
}

export async function apiRequestRaw(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const response = await requestResponse(path, options);
  if (!response.ok) {
    const payload = await readJson(response);
    throwApiError(response, payload);
  }
  return response;
}

export const API_BASE = API_BASE_URL;
