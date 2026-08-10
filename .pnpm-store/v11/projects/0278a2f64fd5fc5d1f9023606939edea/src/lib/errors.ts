export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE"
  | "INTERNAL_ERROR";

export class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fields?: { field: string; message: string }[];

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    fields?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export class ValidationError extends HttpError {
  constructor(fields: { field: string; message: string }[]) {
    super(400, "VALIDATION_ERROR", "One or more fields are invalid.", fields);
  }
}

export class UnauthenticatedError extends HttpError {
  constructor(message = "Authentication required.") {
    super(401, "UNAUTHENTICATED", message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "You are not allowed to perform this action.") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "The requested resource was not found.") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "The resource already exists or conflicts with an existing one.") {
    super(409, "CONFLICT", message);
  }
}

export class UnprocessableError extends HttpError {
  constructor(
    message: string,
    fields?: { field: string; message: string }[],
    code: ErrorCode = "UNPROCESSABLE",
  ) {
    super(422, code, message, fields);
  }
}
