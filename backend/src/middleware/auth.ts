import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { config } from "../lib/config.js";
import type { JwtClaims } from "../lib/config.js";
import { UnauthenticatedError, ForbiddenError } from "../lib/errors.js";

const CHANGE_PASSWORD_PATH = "/change-password";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new UnauthenticatedError());
  }
  const token = header.slice("Bearer ".length).trim();
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
    console.error("[requireRole] needed=", role, "path=", req.path, "userRole=", req.user?.role, "user=", req.user?.id);
    if (!req.user) return next(new UnauthenticatedError());
    if (req.user.role !== role) return next(new ForbiddenError());
    next();
  };
}
