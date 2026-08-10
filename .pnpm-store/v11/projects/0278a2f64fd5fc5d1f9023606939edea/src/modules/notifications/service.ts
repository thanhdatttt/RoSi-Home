import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { notifications } from "../../db/schema.js";
import { sendToToken } from "../../lib/expoPush.js";
import {
  deleteDeviceToken,
  findNotificationByDedupeKey,
  listDeviceTokensForUser,
  upsertDeviceToken,
  type DeviceTokenRow,
} from "./repository.js";

export type SendNotificationInput = {
  userId: string;
  type: string;
  title: string;
  body: string;
  linkRef?: string | null;
  dedupeKey?: string | null;
};

export type SendNotificationResult = { sent: boolean; deduped: boolean };

/**
 * Single internal notification pathway (architecture §6). Every "sends a
 * mobile push notification" acceptance criterion across the backlog must
 * call this function — never build a second delivery path.
 *
 * This never throws. A push-delivery failure (or even an Expo outage) must
 * not roll back or fail the business operation that triggered it (e.g.
 * sending an invoice must stay `Sent` even if the push fails). Call it
 * *after* your own DB transaction has committed — the same pattern already
 * used for `sendEmail` in tenant provisioning — so a slow/blocked HTTP call
 * to Expo never holds a Postgres transaction open.
 */
export async function sendNotification(
  input: SendNotificationInput,
): Promise<SendNotificationResult> {
  try {
    if (input.dedupeKey) {
      const existing = await findNotificationByDedupeKey(input.dedupeKey);
      if (existing) return { sent: false, deduped: true };
    }

    const [row] = await db
      .insert(notifications)
      .values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        linkRef: input.linkRef ?? null,
        dedupeKey: input.dedupeKey ?? null,
        deliveryStatus: "Sent",
      })
      .returning();

    const devices = await listDeviceTokensForUser(input.userId);
    if (devices.length === 0) {
      // No registered device yet — the in-app notification record still
      // exists; there's simply nothing to push to right now.
      return { sent: true, deduped: false };
    }

    let anyOk = false;
    for (const device of devices) {
      const result = await sendToToken(device.pushToken, {
        title: input.title,
        body: input.body,
        data: input.linkRef ? { linkRef: input.linkRef } : undefined,
      });
      if (result.ok) {
        anyOk = true;
      } else if (!result.skipped) {
        console.error(`[notifications] push failed for user ${input.userId}:`, result.error);
      }
    }

    if (!anyOk) {
      await db
        .update(notifications)
        .set({ deliveryStatus: "Failed" })
        .where(eq(notifications.id, row.id));
    }

    return { sent: true, deduped: false };
  } catch (err) {
    console.error("[notifications] sendNotification failed", err);
    return { sent: false, deduped: false };
  }
}

export async function registerDeviceTokenService(
  userId: string,
  pushToken: string,
  platform: "ios" | "android",
): Promise<DeviceTokenRow> {
  return upsertDeviceToken(userId, pushToken, platform);
}

export async function unregisterDeviceTokenService(
  userId: string,
  pushToken: string,
): Promise<void> {
  await deleteDeviceToken(userId, pushToken);
}

// Manual trigger so the mobile app / QA can confirm end-to-end Expo push
// delivery without waiting for a scheduled job to fire.
export async function sendTestNotificationService(
  userId: string,
): Promise<SendNotificationResult> {
  return sendNotification({
    userId,
    type: "test.ping",
    title: "RosiHome test notification",
    body: "If you can see this, Expo push is wired up correctly.",
    linkRef: "test:ping",
  });
}
