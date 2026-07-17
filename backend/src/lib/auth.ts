import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import type { JwtClaims } from "./config.js";

const BCRYPT_COST = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(claims: {
  sub: string;
  role: "Landlord" | "Tenant";
  mustChangePassword: boolean;
}): string {
  return jwt.sign(claims, config.jwtSecret, {
    expiresIn: config.jwtExpirySeconds,
  });
}

export function verifyToken(token: string): JwtClaims {
  return jwt.verify(token, config.jwtSecret) as JwtClaims;
}
