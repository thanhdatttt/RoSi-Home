import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/errors.js";

const SENSITIVE_KEYS = [
  "password",
  "passwordhash",
  "passwordconfirmation",
  "currentpassword",
  "newpassword",
  "newpasswordconfirmation",
  "token",
  "refreshtoken",
  "temptoken",
  "temppassword",
  "authorization",
];

function redact(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value as object)) return "[circular]";
  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, seen));
  }

  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      out[key] = "[redacted]";
    } else {
      out[key] = redact(val, seen);
    }
  }
  return out;
}

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  if (res.headersSent) return _next(err);

  if (err instanceof ZodError) {
    const fields = err.issues.map((issue) => ({
      field: issue.path.join(".") || "body",
      message: issue.message,
    }));
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "One or more fields are invalid.",
        fields,
      },
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
  }

  console.error("[unhandled-error]", redact(err));
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
  });
};
