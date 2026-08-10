import bcrypt from "bcrypt";
import crypto from "crypto";
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

export function signAccessToken(claims: {
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

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Generates a password that satisfies the policy (>=8 chars, one letter, one digit).
export function generateRandomPassword(length = 12): string {
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const all = lower + upper + digits;
  const pick = (set: string) => set[crypto.randomInt(set.length)];
  const chars: string[] = [pick(lower), pick(upper), pick(digits)];
  for (let i = chars.length; i < length; i++) {
    chars.push(pick(all));
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
