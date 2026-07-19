import type { registerSchema, loginSchema, changePasswordSchema, refreshSchema, forgotPasswordSchema } from "./schema.js";
import type { z } from "zod";
import { createLandlord, findUserByUsername, findUserById, insertRefreshToken, findValidRefreshToken, revokeRefreshToken, revokeAllRefreshTokensForUser } from "./repository.js";
import { hashPassword, verifyPassword, signAccessToken, generateRefreshToken, hashRefreshToken, generateRandomPassword } from "../../lib/auth.js";
import { ConflictError, UnauthenticatedError, UnprocessableError } from "../../lib/errors.js";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { writeAudit } from "../../db/audit.js";
import { config } from "../../lib/config.js";
import { sendEmail } from "../../lib/email.js";

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

function publicUser(user: { id: string; role: string; mustChangePassword: boolean }) {
  return {
    id: user.id,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}

async function issueTokenPair(userId: string, role: "Landlord" | "Tenant", mustChangePassword: boolean) {
  const accessToken = signAccessToken({ sub: userId, role, mustChangePassword });
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + config.jwtRefreshExpirySeconds * 1000);
  await insertRefreshToken({ userId, tokenHash: hashRefreshToken(refreshToken), expiresAt });
  return { accessToken, refreshToken, user: publicUser({ id: userId, role, mustChangePassword }) };
}

export async function registerLandlord(input: RegisterInput) {
  const existing = await findUserByUsername(input.email);
  if (existing) {
    throw new ConflictError("Unable to register with these details.");
  }
  const passwordHash = await hashPassword(input.password);
  const user = await createLandlord({
    email: input.email,
    passwordHash,
    fullName: input.fullName,
  });
  return { userId: user.id, role: user.role as "Landlord" };
}

export async function login(input: LoginInput) {
  const user = await findUserByUsername(input.username);
  if (!user) throw new UnauthenticatedError("Invalid credentials.");
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new UnauthenticatedError("Invalid credentials.");
  if (user.status === "Inactive") throw new UnauthenticatedError("Invalid credentials.");
  return issueTokenPair(user.id, user.role as "Landlord" | "Tenant", user.mustChangePassword);
}

export async function refreshTokens(input: RefreshInput) {
  const record = await findValidRefreshToken(hashRefreshToken(input.refreshToken));
  if (!record) throw new UnauthenticatedError("Invalid or expired session.");
  await revokeRefreshToken(record.id);
  const user = await findUserById(record.userId);
  if (!user) throw new UnauthenticatedError("Invalid or expired session.");
  return issueTokenPair(user.id, user.role as "Landlord" | "Tenant", user.mustChangePassword);
}

export async function logout(userId: string, refreshToken?: string) {
  if (refreshToken) {
    const record = await findValidRefreshToken(hashRefreshToken(refreshToken));
    if (record) await revokeRefreshToken(record.id);
  }
  return { success: true };
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new UnauthenticatedError();
  const ok = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!ok) throw new UnauthenticatedError("Current password is incorrect.");
  if (input.currentPassword === input.newPassword) {
    throw new UnprocessableError("New password must differ from the current password.");
  }
  const newHash = await hashPassword(input.newPassword);
  await db
    .update(users)
    .set({ passwordHash: newHash, mustChangePassword: false })
    .where(eq(users.id, userId));
  await writeAudit({
    actorUserId: userId,
    action: "password.changed",
    entityType: "users",
    entityId: userId,
  });
  return { success: true };
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await findUserByUsername(input.email);
  // Always return success (no enumeration) even when the email is unknown.
  if (user) {
    const newPassword = generateRandomPassword();
    const newHash = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ passwordHash: newHash, mustChangePassword: false })
      .where(eq(users.id, user.id));
    await revokeAllRefreshTokensForUser(user.id);
    await writeAudit({
      actorUserId: user.id,
      action: "password.reset",
      entityType: "users",
      entityId: user.id,
    });
    await sendEmail(
      input.email,
      "RosiHome — Your new password",
      `Your password has been reset. You can log in with the temporary password below:\n\n${newPassword}\n\nFor your security, please change it after logging in.`,
    );
  }
  return { success: true };
}
