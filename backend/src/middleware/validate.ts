import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../lib/errors.js";

type Target = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: Target = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || target,
        message: issue.message,
      }));
      return next(new ValidationError(fields));
    }
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}
