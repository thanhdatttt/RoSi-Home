import { randomUUID } from "node:crypto";
import { writeAudit } from "../../db/audit.js";
import { db, type Db } from "../../db/index.js";
import { NotFoundError } from "../../lib/errors.js";
import {
  deleteMaintenancePhoto,
  uploadMaintenancePhoto,
  type StoredMaintenancePhoto,
} from "../../lib/storage.js";
import { sendNotification } from "../notifications/service.js";
import {
  type MaintenancePhotoInput,
  validateMaintenancePhotos,
} from "./photos.js";
import {
  findActiveLeaseForTenantRoom,
  insertMaintenancePhotos,
  insertMaintenanceRequest,
  type MaintenancePhotoRow,
  type MaintenanceRequestRow,
} from "./repository.js";
import type { SubmitMaintenanceRequestInput } from "./schema.js";

export type MaintenanceRequestView = {
  id: string;
  roomId: string;
  tenantInfoId: string;
  title: string;
  description: string;
  status: "Pending" | "InProgress" | "Completed";
  submittedAt: string;
  photos: { id: string; fileUrl: string }[];
};

function serialize(
  request: MaintenanceRequestRow,
  photos: MaintenancePhotoRow[],
): MaintenanceRequestView {
  return {
    id: request.id,
    roomId: request.roomId,
    tenantInfoId: request.tenantInfoId,
    title: request.title,
    description: request.description,
    status: request.status,
    submittedAt: request.submittedAt.toISOString(),
    photos: photos.map((photo) => ({ id: photo.id, fileUrl: photo.fileUrl })),
  };
}

async function cleanupUploadedPhotos(
  uploaded: readonly StoredMaintenancePhoto[],
): Promise<void> {
  const results = await Promise.allSettled(
    uploaded.map((photo) => deleteMaintenancePhoto(photo.objectPath)),
  );
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[maintenance] failed to clean up uploaded photo", result.reason);
    }
  }
}

export async function submitMaintenanceRequestService(
  tenantUserId: string,
  input: SubmitMaintenanceRequestInput,
  rawPhotos: readonly MaintenancePhotoInput[],
): Promise<MaintenanceRequestView> {
  // Batch validation happens before lease lookup and, critically, before the
  // first storage write so an invalid file can never leave an orphan.
  const photos = validateMaintenancePhotos(rawPhotos);
  const initialLease = await findActiveLeaseForTenantRoom(
    tenantUserId,
    input.roomId,
  );
  if (!initialLease) {
    throw new NotFoundError("Active lease not found for this room.");
  }

  const requestId = randomUUID();
  const photoIds = photos.map(() => randomUUID());
  const uploaded: StoredMaintenancePhoto[] = [];
  let committed = false;

  try {
    for (const [index, photo] of photos.entries()) {
      uploaded.push(
        await uploadMaintenancePhoto({
          objectPath: `${tenantUserId}/${requestId}/${photoIds[index]}.${photo.extension}`,
          buffer: photo.buffer,
          contentType: photo.contentType,
        }),
      );
    }

    const persisted = await db.transaction(async (rawTx) => {
      const tx = rawTx as unknown as Db;
      // Re-check inside the write transaction in case the lease was ended or
      // archived while the external storage uploads were in progress.
      const lease = await findActiveLeaseForTenantRoom(
        tenantUserId,
        input.roomId,
        tx,
      );
      if (!lease) {
        throw new NotFoundError("Active lease not found for this room.");
      }

      const request = await insertMaintenanceRequest(
        {
          id: requestId,
          roomId: input.roomId,
          tenantInfoId: lease.tenantInfoId,
          title: input.title,
          description: input.description,
          status: "Pending",
        },
        tx,
      );
      const photoRows = await insertMaintenancePhotos(
        uploaded.map((photo, index) => ({
          id: photoIds[index],
          requestId: request.id,
          fileUrl: photo.fileUrl,
        })),
        tx,
      );
      await writeAudit(
        {
          actorUserId: tenantUserId,
          action: "maintenance_request.created",
          entityType: "maintenance_requests",
          entityId: request.id,
          afterValue: {
            roomId: request.roomId,
            tenantInfoId: request.tenantInfoId,
            status: request.status,
            photoCount: photoRows.length,
          },
        },
        tx,
      );
      return { request, photoRows, lease };
    });
    committed = true;

    // Push delivery is deliberately after commit and best-effort. It can never
    // roll back a valid maintenance request.
    await sendNotification({
      userId: persisted.lease.landlordId,
      type: "maintenance.created",
      title: "New maintenance request",
      body: `${persisted.lease.roomName}: ${persisted.request.title}`,
      linkRef: `maintenance:${persisted.request.id}`,
      dedupeKey: `maintenance.created:${persisted.request.id}`,
    }).catch(() => undefined);

    return serialize(persisted.request, persisted.photoRows);
  } catch (error) {
    if (!committed) await cleanupUploadedPhotos(uploaded);
    throw error;
  }
}
