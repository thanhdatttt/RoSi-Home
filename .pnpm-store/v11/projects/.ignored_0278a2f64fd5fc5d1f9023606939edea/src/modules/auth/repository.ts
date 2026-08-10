import { db } from "../../db/index.js";
import { landlordProfiles, refreshTokens, users } from "../../db/schema.js";
import { and, eq, gt, isNull } from "drizzle-orm";

export async function findUserByUsername(username: string) {
  return db.query.users.findFirst({ where: eq(users.username, username) });
}

export async function findUserById(userId: string) {
  return db.query.users.findFirst({ where: eq(users.id, userId) });
}

export async function findProfileByUserId(userId: string) {
  return db.query.landlordProfiles.findFirst({
    where: eq(landlordProfiles.userId, userId),
  });
}

export async function createLandlord(input: {
  email: string;
  passwordHash: string;
  fullName: string;
}) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        role: "Landlord",
        username: input.email,
        passwordHash: input.passwordHash,
      })
      .returning();
    await tx.insert(landlordProfiles).values({
      userId: user.id,
      fullName: input.fullName,
      email: input.email,
    });
    return user;
  });
}

export async function insertRefreshToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const [row] = await db
    .insert(refreshTokens)
    .values(input)
    .returning();
  return row;
}

export async function findValidRefreshToken(tokenHash: string) {
  return db.query.refreshTokens.findFirst({
    where: and(
      eq(refreshTokens.tokenHash, tokenHash),
      isNull(refreshTokens.revokedAt),
      gt(refreshTokens.expiresAt, new Date()),
    ),
  });
}

export async function revokeRefreshToken(id: string) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, id));
}

export async function revokeAllRefreshTokensForUser(userId: string) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
}

