import { db } from "../../db/index.js";
import { landlordProfiles, users, userRoleEnum } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function findUserByUsername(username: string) {
  return db.query.users.findFirst({ where: eq(users.username, username) });
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
