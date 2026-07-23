import { config } from "./config.js";

const MAINTENANCE_BUCKET = "maintenance-photos";

export type MaintenancePhotoStorageInput = {
  objectPath: string;
  buffer: Buffer;
  contentType: "image/png" | "image/jpeg";
};

export type StoredMaintenancePhoto = {
  objectPath: string;
  fileUrl: string;
};

function settings(): { baseUrl: string; serviceKey: string } {
  const baseUrl = config.supabaseUrl.replace(/\/+$/, "");
  const serviceKey = config.supabaseServiceKey;
  if (!baseUrl || !serviceKey) {
    throw new Error(
      "Maintenance photo storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.",
    );
  }
  return { baseUrl, serviceKey };
}

function encodedObjectPath(objectPath: string): string {
  return objectPath.split("/").map(encodeURIComponent).join("/");
}

function headers(serviceKey: string): Record<string, string> {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
}

/** Uploads to a private Supabase Storage bucket and returns a storage path. */
export async function uploadMaintenancePhoto(
  input: MaintenancePhotoStorageInput,
): Promise<StoredMaintenancePhoto> {
  const { baseUrl, serviceKey } = settings();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${MAINTENANCE_BUCKET}/${encodedObjectPath(input.objectPath)}`,
    {
      method: "POST",
      headers: {
        ...headers(serviceKey),
        "Content-Type": input.contentType,
        "x-upsert": "false",
      },
      body: input.buffer,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Maintenance photo upload failed with storage status ${response.status}.`,
    );
  }
  return {
    objectPath: input.objectPath,
    fileUrl: `${MAINTENANCE_BUCKET}/${input.objectPath}`,
  };
}

/** Best-effort compensation target used when a later upload/DB write fails. */
export async function deleteMaintenancePhoto(objectPath: string): Promise<void> {
  const { baseUrl, serviceKey } = settings();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${MAINTENANCE_BUCKET}/${encodedObjectPath(objectPath)}`,
    { method: "DELETE", headers: headers(serviceKey) },
  );
  if (!response.ok && response.status !== 404) {
    throw new Error(
      `Maintenance photo cleanup failed with storage status ${response.status}.`,
    );
  }
}

/** Creates a five-minute URL for an authorized read from the private bucket. */
export async function createSignedMaintenancePhotoUrl(
  fileUrl: string,
  expiresIn = 300,
): Promise<string> {
  const prefix = `${MAINTENANCE_BUCKET}/`;
  if (!fileUrl.startsWith(prefix)) {
    throw new Error("Invalid maintenance photo storage path.");
  }
  const objectPath = fileUrl.slice(prefix.length);
  const segments = objectPath.split("/");
  if (
    !objectPath ||
    segments.some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new Error("Invalid maintenance photo storage path.");
  }

  const { baseUrl, serviceKey } = settings();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/sign/${MAINTENANCE_BUCKET}/${encodedObjectPath(objectPath)}`,
    {
      method: "POST",
      headers: {
        ...headers(serviceKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn }),
    },
  );
  if (!response.ok) {
    throw new Error(
      `Maintenance photo signed URL failed with storage status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as { signedURL?: unknown };
  if (typeof payload.signedURL !== "string" || payload.signedURL.length === 0) {
    throw new Error("Maintenance photo storage did not return a signed URL.");
  }
  if (
    payload.signedURL.startsWith("http://") ||
    payload.signedURL.startsWith("https://")
  ) {
    return payload.signedURL;
  }
  if (payload.signedURL.startsWith("/storage/v1/")) {
    return `${baseUrl}${payload.signedURL}`;
  }
  const storagePath = payload.signedURL.startsWith("/")
    ? payload.signedURL
    : `/${payload.signedURL}`;
  return `${baseUrl}/storage/v1${storagePath}`;
}
