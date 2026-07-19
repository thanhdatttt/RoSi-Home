import { db } from "../../db/index.js";
import { landlordProfiles, users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { isUniqueViolation } from "../../lib/pgErrors.js";

export async function getOwnProfile(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new NotFoundError("User not found.");
  const profile = await db.query.landlordProfiles.findFirst({
    where: eq(landlordProfiles.userId, userId),
  });
  return {
    id: user.id,
    role: user.role,
    username: user.username,
    fullName: profile?.fullName ?? null,
    email: profile?.email ?? user.username,
    phone: profile?.phone ?? null,
  };
}

export async function updateOwnProfile(userId: string, input: { fullName?: string; phone?: string }) {
  const profile = await db.query.landlordProfiles.findFirst({
    where: eq(landlordProfiles.userId, userId),
  });
  if (!profile) throw new NotFoundError("Profile not found.");

  if (input.phone !== undefined && input.phone !== profile.phone) {
    try {
      await db
        .update(landlordProfiles)
        .set({ phone: input.phone })
        .where(eq(landlordProfiles.userId, userId));
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictError("This phone number is already in use.");
      }
      throw err;
    }
  }
  if (input.fullName !== undefined) {
    await db
      .update(landlordProfiles)
      .set({ fullName: input.fullName })
      .where(eq(landlordProfiles.userId, userId));
  }
  return getOwnProfile(userId);
}
