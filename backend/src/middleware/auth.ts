import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { config } from "../lib/config.js";
import type { JwtClaims } from "../lib/config.js";
import { UnauthenticatedError, ForbiddenError } from "../lib/errors.js";

const CHANGE_PASSWORD_PATH = "/change-password";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  let token: string | undefined;
  
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    token = header.slice("Bearer ".length).trim();
  } else if (req.query.token && typeof req.query.token === "string") {
    token = req.query.token;
  }

  if (!token) {
    return next(new UnauthenticatedError());
  }
  let claims: JwtClaims;
  try {
    claims = jwt.verify(token, config.jwtSecret) as JwtClaims;
  } catch {
    return next(new UnauthenticatedError());
  }
  req.user = { id: claims.sub, role: claims.role };

  if (claims.mustChangePassword && req.path !== CHANGE_PASSWORD_PATH) {
    return next(new ForbiddenError("You must change your password before continuing."));
  }
  next();
}

export function requireRole(role: "Landlord" | "Tenant") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthenticatedError());
    if (req.user.role !== role) return next(new ForbiddenError());
    next();
  };
}
