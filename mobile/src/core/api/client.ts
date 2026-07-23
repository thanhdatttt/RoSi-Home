import { API_BASE_URL, API_TIMEOUT_MS } from './config';
import { emptyTokenProvider, TokenProvider } from './auth';
import { ApiError } from './types';

export type ApiRequest = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  authenticated?: boolean;
  timeoutMs?: number;
};

export interface ApiClient {
  request<T>(request: ApiRequest): Promise<T>;
}

function errorKind(status: number) {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not-found';
  if (status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}

export class FetchApiClient implements ApiClient {
  constructor(
    private readonly baseUrl = API_BASE_URL,
    private readonly tokenProvider: TokenProvider = emptyTokenProvider,
  ) {}

  async request<T>({
    method = 'GET',
    path,
    body,
    headers,
    authenticated = true,
    timeoutMs = API_TIMEOUT_MS,
  }: ApiRequest): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiError(
        'EXPO_PUBLIC_API_BASE_URL chưa được cấu hình.',
        'configuration',
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const accessToken = authenticated ? await this.tokenProvider.getAccessToken() : null;
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string; fields?: Record<string, string> } }
        | T
        | null;
      if (!response.ok) {
        if (response.status === 401) await this.tokenProvider.handleUnauthorized();
        const apiPayload = payload as
          | { error?: { message?: string; fields?: Record<string, string> } }
          | null;
        throw new ApiError(
          apiPayload?.error?.message ?? 'Yêu cầu không thành công.',
          errorKind(response.status),
          response.status,
          apiPayload?.error?.fields,
        );
      }
      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Yêu cầu đã hết thời gian chờ.', 'timeout');
      }
      throw new ApiError('Không thể kết nối đến máy chủ.', 'network');
    } finally {
      clearTimeout(timeout);
    }
  }
}
