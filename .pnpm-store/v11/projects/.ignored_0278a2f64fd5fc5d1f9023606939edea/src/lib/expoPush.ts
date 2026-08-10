import { config } from "./config.js";

// RosiHome delivers mobile push through Expo's push service instead of
// calling FCM/APNs directly. The mobile app is an Expo (React Native) app,
// so `expo-notifications` already gives each device an Expo push token
// (e.g. "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]") and Expo's hosted
// service fans that out to FCM/APNs on our behalf. This keeps the backend
// free of Firebase/Apple credentials for the MVP.
const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

export type ExpoPushMessage = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export type ExpoPushResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

export function isExpoPushToken(token: string): boolean {
  return /^(ExponentPushToken|ExpoPushToken)\[.+\]$/.test(token.trim());
}

type ExpoTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

export async function sendToToken(
  pushToken: string,
  message: ExpoPushMessage,
): Promise<ExpoPushResult> {
  if (!isExpoPushToken(pushToken)) {
    return { ok: false, skipped: true, error: "Not a valid Expo push token." };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate",
  };
  // Optional: an Expo access token enables "Enhanced Security for Push
  // Notifications" (per-project push-sending restrictions). Not required to
  // send push notifications.
  if (config.expoAccessToken) {
    headers.Authorization = `Bearer ${config.expoAccessToken}`;
  }

  try {
    const res = await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify([
        {
          to: pushToken,
          title: message.title,
          body: message.body,
          data: message.data ?? {},
          sound: "default",
        },
      ]),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[expoPush] send failed", res.status, text);
      return { ok: false, error: `Expo push responded ${res.status}` };
    }

    const json = (await res.json()) as { data?: ExpoTicket[]; errors?: unknown[] };
    const ticket = json.data?.[0];
    if (!ticket || ticket.status !== "ok") {
      const error = ticket?.details?.error ?? ticket?.message ?? "Unknown Expo push error";
      console.error("[expoPush] ticket error", error);
      return { ok: false, error: String(error) };
    }
    return { ok: true };
  } catch (err) {
    console.error("[expoPush] send error", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}
