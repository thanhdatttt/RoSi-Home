import { GoogleAuth } from "google-auth-library";
import { config } from "./config.js";

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const FCM_ENDPOINT = "https://fcm.googleapis.com/v1/projects";

export type FcmMessage = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export type FcmResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

type ParsedAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, "\n");
}

function loadAccount(): ParsedAccount | null {
  const raw = config.firebaseServiceAccountJson.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ParsedAccount>;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      return null;
    }
    return {
      project_id: parsed.project_id,
      client_email: parsed.client_email,
      private_key: normalizePrivateKey(parsed.private_key),
    };
  } catch {
    console.warn("[fcm] FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON; push notifications disabled.");
    return null;
  }
}

const account = loadAccount();

const auth = account
  ? new GoogleAuth({
      credentials: {
        client_email: account.client_email,
        private_key: account.private_key,
      },
      scopes: [FCM_SCOPE],
    })
  : null;

let warned = false;

export async function sendToToken(
  fcmToken: string,
  message: FcmMessage,
): Promise<FcmResult> {
  if (!auth || !account) {
    if (!warned) {
      console.warn("[fcm] No Firebase credentials configured; push notifications are disabled (no-op).");
      warned = true;
    }
    return { ok: false, skipped: true };
  }

  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const token = typeof accessToken === "string" ? accessToken : accessToken.token;

    const res = await fetch(`${FCM_ENDPOINT}/${account.project_id}/messages:send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: {
            title: message.title,
            body: message.body,
          },
          data: message.data ?? {},
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[fcm] send failed", res.status, text);
      return { ok: false, error: `FCM ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[fcm] send error", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}
