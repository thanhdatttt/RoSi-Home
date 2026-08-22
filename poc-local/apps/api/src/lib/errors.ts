export class HttpError extends Error {
  readonly code: string;
  readonly details: unknown;
  readonly statusCode: number;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
