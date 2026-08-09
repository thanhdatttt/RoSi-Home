import Constants from 'expo-constants';

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

  const res = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as Record<string, unknown> & ApiErrorPayload) : {};

  if (!res.ok) {
    const errPayload = json as ApiErrorPayload;
    const message =
      errPayload.error?.message ?? `Request failed with status ${res.status}`;
    throw new ApiRequestError(res.status, message, errPayload);
  }

  return json.data as T;
}

export const API_BASE = API_BASE_URL;
