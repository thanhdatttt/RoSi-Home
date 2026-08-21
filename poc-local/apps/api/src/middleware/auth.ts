import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { HttpError } from "../lib/errors.js";

const claimsSchema = z.object({
  sub: z.string().min(1),
  role: z.literal("Landlord"),
});

export interface AuthenticatedUser {
  role: "Landlord";
  userId: string;
}

export function requireAuthentication(jwtSecret: string) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const authorization = request.header("authorization");
    const [scheme, token] = authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
      next(new HttpError(401, "UNAUTHORIZED", "Authentication is required"));
      return;
    }

    try {
      const claims = claimsSchema.parse(jwt.verify(token, jwtSecret));
      request.auth = {
        role: claims.role,
        userId: claims.sub,
      };
      next();
    } catch {
      next(new HttpError(401, "UNAUTHORIZED", "Authentication is invalid"));
    }
  };
}

export function getAuthenticatedUser(request: Request): AuthenticatedUser {
  if (!request.auth) {
    throw new HttpError(401, "UNAUTHORIZED", "Authentication is required");
  }
  return request.auth;
}
