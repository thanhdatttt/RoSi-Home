export type ApiEnvelope<T> = { data: T };
export type ApiListMeta = { page: number; pageSize: number; total: number };
export type ApiListEnvelope<T> = { data: T[]; meta: ApiListMeta };
export type ApiFieldError = { field: string; message: string };

export type ApiErrorKind =
  | 'configuration'
  | 'network'
  | 'timeout'
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'server'
  | 'unknown';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly kind: ApiErrorKind,
    public readonly status?: number,
    public readonly fields?: ApiFieldError[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
