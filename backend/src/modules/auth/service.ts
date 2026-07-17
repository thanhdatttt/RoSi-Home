import type { registerSchema, loginSchema, changePasswordSchema } from "./schema.js";
import type { z } from "zod";
import { createLandlord, findUserByUsername } from "./repository.js";
import { hashPassword, verifyPassword, signToken } from "../../lib/auth.js";
import { ConflictError, UnauthenticatedError, UnprocessableError } from "../../lib/errors.js";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { writeAudit } from "../../db/audit.js";

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

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
  const token = signToken({
    sub: user.id,
    role: user.role as "Landlord" | "Tenant",
    mustChangePassword: user.mustChangePassword,
  });
  return {
    token,
    user: {
      id: user.id,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  };
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
