import { API_BASE_URL, API_TIMEOUT_MS } from './config';
import { emptyTokenProvider, TokenProvider } from './auth';
import { ApiError } from './types';

export type ApiRequest = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown | FormData;
  headers?: Record<string, string>;
  authenticated?: boolean;
  timeoutMs?: number;
  responseType?: 'json' | 'text' | 'arrayBuffer';
};

export interface ApiClient {
  request<T>(request: ApiRequest): Promise<T>;
}

function errorKind(status: number) {
  if (status === 400 || status === 422) return 'validation';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not-found';
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
    responseType = 'json',
  }: ApiRequest): Promise<T> {
    return this.requestOnce<T>(
      { method, path, body, headers, authenticated, timeoutMs, responseType },
      true,
    );
  }

  private async requestOnce<T>(
    request: Required<Pick<ApiRequest, 'method' | 'path' | 'authenticated' | 'timeoutMs' | 'responseType'>> &
      Pick<ApiRequest, 'body' | 'headers'>,
    allowRefresh: boolean,
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiError(
        'EXPO_PUBLIC_API_BASE_URL chưa được cấu hình.',
        'configuration',
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs);
    try {
      const accessToken = request.authenticated
        ? await this.tokenProvider.getAccessToken()
        : null;
      const isFormData =
        typeof FormData !== 'undefined' && request.body instanceof FormData;
      const requestBody: BodyInit | undefined =
        request.body === undefined
          ? undefined
          : isFormData
            ? (request.body as FormData)
            : JSON.stringify(request.body);
      const response = await fetch(`${this.baseUrl}${request.path}`, {
        method: request.method,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(request.body === undefined || isFormData
            ? {}
            : { 'Content-Type': 'application/json' }),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...request.headers,
        },
        body: requestBody,
      });

      if (response.status === 401 && request.authenticated && allowRefresh) {
        const refreshedToken = await this.tokenProvider.refreshAccessToken();
        if (refreshedToken) {
          return this.requestOnce<T>(request, false);
        }
        await this.tokenProvider.handleUnauthorized();
      }

      const payload =
        request.responseType === 'arrayBuffer' && response.ok
          ? await response.arrayBuffer()
          : request.responseType === 'text' && response.ok
            ? await response.text()
            : await response.json().catch(() => null);

      if (!response.ok) {
        const apiPayload = payload as
          | {
              error?: {
                message?: string;
                fields?: { field: string; message: string }[];
              };
            }
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
