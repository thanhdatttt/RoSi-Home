import { and, eq } from "drizzle-orm";
import { db, type Db } from "../../db/index.js";
import { deviceTokens, notifications } from "../../db/schema.js";

export type DeviceTokenRow = typeof deviceTokens.$inferSelect;
export type NotificationRow = typeof notifications.$inferSelect;

// A push token can move between accounts (device reinstall, a different
// user logging in on the same device) — re-point it to the current user
// instead of failing the table's unique(push_token) constraint.
export async function upsertDeviceToken(
  userId: string,
  pushToken: string,
  platform: "ios" | "android",
  executor: Db = db,
): Promise<DeviceTokenRow> {
  const [existing] = await executor
    .select()
    .from(deviceTokens)
    .where(eq(deviceTokens.pushToken, pushToken));

  if (existing) {
    const [row] = await executor
      .update(deviceTokens)
      .set({ userId, platform })
      .where(eq(deviceTokens.id, existing.id))
      .returning();
    return row;
  }

  const [row] = await executor
    .insert(deviceTokens)
    .values({ userId, pushToken, platform })
    .returning();
  return row;
}

export async function deleteDeviceToken(
  userId: string,
  pushToken: string,
  executor: Db = db,
): Promise<void> {
  await executor
    .delete(deviceTokens)
    .where(and(eq(deviceTokens.userId, userId), eq(deviceTokens.pushToken, pushToken)));
}

export async function listDeviceTokensForUser(
  userId: string,
  executor: Db = db,
): Promise<DeviceTokenRow[]> {
  return executor.select().from(deviceTokens).where(eq(deviceTokens.userId, userId));
}

export async function findNotificationByDedupeKey(
  dedupeKey: string,
  executor: Db = db,
): Promise<NotificationRow | null> {
  const [row] = await executor
    .select()
    .from(notifications)
    .where(eq(notifications.dedupeKey, dedupeKey));
  return row ?? null;
}
