import { randomUUID } from "node:crypto";
import { writeAudit } from "../../db/audit.js";
import { db, type Db } from "../../db/index.js";
import { NotFoundError } from "../../lib/errors.js";
import {
  type Paginated,
  type Pagination,
  paginate,
} from "../../lib/pagination.js";
import {
  createSignedMaintenancePhotoUrl,
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
  countMaintenanceRequestsForLandlord,
  countMaintenanceRequestsForTenantUser,
  findMaintenancePhotosByRequestIds,
  findMaintenanceRequestForLandlord,
  findMaintenanceRequestForTenantUser,
  insertMaintenancePhotos,
  insertMaintenanceRequest,
  listMaintenanceRequestsForLandlord,
  listMaintenanceRequestsForTenantUser,
  type LandlordMaintenanceRequestFilters,
  type LandlordMaintenanceRequestRow,
  type MaintenancePhotoRow,
  type MaintenanceRequestRow,
  type TenantMaintenanceRequestRow,
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

export type TenantMaintenanceRequestView = {
  id: string;
  title: string;
  description: string;
  room: { id: string; name: string };
  status: "Pending" | "InProgress" | "Completed";
  submittedAt: string;
  photos: { id: string; fileUrl: string }[];
};

export type LandlordMaintenanceRequestView = {
  id: string;
  title: string;
  description: string;
  property: { id: string; name: string };
  room: { id: string; name: string };
  tenant: { id: string; fullName: string };
  status: "Pending" | "InProgress" | "Completed";
  submittedAt: string;
  photos: { id: string; fileUrl: string }[];
};

type MaintenanceActor = { id: string; role: "Landlord" | "Tenant" };

function serializeSubmission(
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

async function serializeTenantRequest(
  request: TenantMaintenanceRequestRow,
  photos: readonly MaintenancePhotoRow[],
): Promise<TenantMaintenanceRequestView> {
  const signedPhotos = await Promise.all(
    photos.map(async (photo) => ({
      id: photo.id,
      fileUrl: await createSignedMaintenancePhotoUrl(photo.fileUrl),
    })),
  );
  return {
    id: request.id,
    title: request.title,
    description: request.description,
    room: { id: request.roomId, name: request.roomName },
    status: request.status,
    submittedAt: request.submittedAt.toISOString(),
    photos: signedPhotos,
  };
}

async function serializeLandlordRequest(
  request: LandlordMaintenanceRequestRow,
  photos: readonly MaintenancePhotoRow[],
): Promise<LandlordMaintenanceRequestView> {
  const signedPhotos = await Promise.all(
    photos.map(async (photo) => ({
      id: photo.id,
      fileUrl: await createSignedMaintenancePhotoUrl(photo.fileUrl),
    })),
  );
  return {
    id: request.id,
    title: request.title,
    description: request.description,
    property: { id: request.propertyId, name: request.propertyName },
    room: { id: request.roomId, name: request.roomName },
    tenant: { id: request.tenantInfoId, fullName: request.tenantFullName },
    status: request.status,
    submittedAt: request.submittedAt.toISOString(),
    photos: signedPhotos,
  };
}

function groupPhotosByRequest(
  photos: readonly MaintenancePhotoRow[],
): Map<string, MaintenancePhotoRow[]> {
  const grouped = new Map<string, MaintenancePhotoRow[]>();
  for (const photo of photos) {
    const requestPhotos = grouped.get(photo.requestId) ?? [];
    requestPhotos.push(photo);
    grouped.set(photo.requestId, requestPhotos);
  }
  return grouped;
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

    return serializeSubmission(persisted.request, persisted.photoRows);
  } catch (error) {
    if (!committed) await cleanupUploadedPhotos(uploaded);
    throw error;
  }
}

export async function listTenantMaintenanceRequestsService(
  tenantUserId: string,
  pagination: Pagination,
): Promise<Paginated<TenantMaintenanceRequestView>> {
  const [requests, total] = await Promise.all([
    listMaintenanceRequestsForTenantUser(tenantUserId, pagination),
    countMaintenanceRequestsForTenantUser(tenantUserId),
  ]);
  const photos = await findMaintenancePhotosByRequestIds(
    requests.map((request) => request.id),
  );
  const photosByRequest = groupPhotosByRequest(photos);
  const views = await Promise.all(
    requests.map((request) =>
      serializeTenantRequest(request, photosByRequest.get(request.id) ?? []),
    ),
  );
  return paginate(views, total, pagination);
}

export async function getTenantMaintenanceRequestService(
  tenantUserId: string,
  requestId: string,
): Promise<TenantMaintenanceRequestView> {
  const request = await findMaintenanceRequestForTenantUser(
    tenantUserId,
    requestId,
  );
  if (!request) throw new NotFoundError("Maintenance request not found.");
  const photos = await findMaintenancePhotosByRequestIds([request.id]);
  return serializeTenantRequest(request, photos);
}

export async function listMaintenanceRequestsService(
  actor: MaintenanceActor,
  pagination: Pagination,
  filters: LandlordMaintenanceRequestFilters = {},
): Promise<
  Paginated<TenantMaintenanceRequestView | LandlordMaintenanceRequestView>
> {
  if (actor.role === "Tenant") {
    return listTenantMaintenanceRequestsService(actor.id, pagination);
  }

  const [requests, total] = await Promise.all([
    listMaintenanceRequestsForLandlord(actor.id, pagination, filters),
    countMaintenanceRequestsForLandlord(actor.id, filters),
  ]);
  const photos = await findMaintenancePhotosByRequestIds(
    requests.map((request) => request.id),
  );
  const photosByRequest = groupPhotosByRequest(photos);
  const views = await Promise.all(
    requests.map((request) =>
      serializeLandlordRequest(request, photosByRequest.get(request.id) ?? []),
    ),
  );
  return paginate(views, total, pagination);
}

export async function getMaintenanceRequestService(
  actor: MaintenanceActor,
  requestId: string,
): Promise<TenantMaintenanceRequestView | LandlordMaintenanceRequestView> {
  if (actor.role === "Tenant") {
    return getTenantMaintenanceRequestService(actor.id, requestId);
  }

  const request = await findMaintenanceRequestForLandlord(actor.id, requestId);
  if (!request) throw new NotFoundError("Maintenance request not found.");
  const photos = await findMaintenancePhotosByRequestIds([request.id]);
  return serializeLandlordRequest(request, photos);
}
