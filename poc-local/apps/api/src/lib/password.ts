import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export interface PasswordDigest {
  hash: string;
  salt: string;
}

export function hashPassword(password: string): PasswordDigest {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return { hash, salt };
}

export function verifyPassword(
  password: string,
  expectedHash: string,
  salt: string,
): boolean {
  const actual = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(expectedHash, "hex");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
