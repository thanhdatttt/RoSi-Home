import { beforeEach, describe, expect, it, vi } from "vitest";

const TENANT_USER_ID = "55555555-5555-4555-8555-555555555555";
const TENANT_INFO_ID = "77777777-7777-4777-8777-777777777777";
const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const ROOM_ID = "66666666-6666-4666-8666-666666666666";

const mocks = vi.hoisted(() => {
  const trx = { kind: "maintenance-transaction" };
  return {
    trx,
    transaction: vi.fn(async (callback: (executor: unknown) => unknown) =>
      callback(trx),
    ),
    findActiveLeaseForTenantRoom: vi.fn(),
    insertMaintenanceRequest: vi.fn(),
    insertMaintenancePhotos: vi.fn(),
    listMaintenanceRequestsForTenantUser: vi.fn(),
    countMaintenanceRequestsForTenantUser: vi.fn(),
    findMaintenanceRequestForTenantUser: vi.fn(),
    listMaintenanceRequestsForLandlord: vi.fn(),
    countMaintenanceRequestsForLandlord: vi.fn(),
    findMaintenanceRequestForLandlord: vi.fn(),
    findMaintenancePhotosByRequestIds: vi.fn(),
    writeAudit: vi.fn(),
    uploadMaintenancePhoto: vi.fn(),
    deleteMaintenancePhoto: vi.fn(),
    createSignedMaintenancePhotoUrl: vi.fn(),
    sendNotification: vi.fn(),
  };
});

vi.mock("../../../src/db/index.js", () => ({
  db: { transaction: mocks.transaction },
}));

vi.mock("../../../src/db/audit.js", () => ({ writeAudit: mocks.writeAudit }));

vi.mock("../../../src/modules/maintenance/repository.js", () => ({
  findActiveLeaseForTenantRoom: mocks.findActiveLeaseForTenantRoom,
  insertMaintenanceRequest: mocks.insertMaintenanceRequest,
  insertMaintenancePhotos: mocks.insertMaintenancePhotos,
  listMaintenanceRequestsForTenantUser: mocks.listMaintenanceRequestsForTenantUser,
  countMaintenanceRequestsForTenantUser: mocks.countMaintenanceRequestsForTenantUser,
  findMaintenanceRequestForTenantUser: mocks.findMaintenanceRequestForTenantUser,
  listMaintenanceRequestsForLandlord: mocks.listMaintenanceRequestsForLandlord,
  countMaintenanceRequestsForLandlord: mocks.countMaintenanceRequestsForLandlord,
  findMaintenanceRequestForLandlord: mocks.findMaintenanceRequestForLandlord,
  findMaintenancePhotosByRequestIds: mocks.findMaintenancePhotosByRequestIds,
}));

vi.mock("../../../src/lib/storage.js", () => ({
  uploadMaintenancePhoto: mocks.uploadMaintenancePhoto,
  deleteMaintenancePhoto: mocks.deleteMaintenancePhoto,
  createSignedMaintenancePhotoUrl: mocks.createSignedMaintenancePhotoUrl,
}));

vi.mock("../../../src/modules/notifications/service.js", () => ({
  sendNotification: mocks.sendNotification,
}));

import {
  getMaintenanceRequestService,
  getTenantMaintenanceRequestService,
  listMaintenanceRequestsService,
  listTenantMaintenanceRequestsService,
  submitMaintenanceRequestService,
} from "../../../src/modules/maintenance/service.js";

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function photo(name = "issue.png") {
  return {
    originalName: name,
    declaredContentType: "image/png",
    buffer: png,
  };
}

function requestRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
    roomId: ROOM_ID,
    tenantInfoId: TENANT_INFO_ID,
    title: "Leaking sink",
    description: "Water is leaking continuously below the sink.",
    status: "Pending" as const,
    submittedAt: new Date("2026-07-22T02:00:00.000Z"),
    completedAt: null,
    createdAt: new Date("2026-07-22T02:00:00.000Z"),
    updatedAt: new Date("2026-07-22T02:00:00.000Z"),
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

describe("submitMaintenanceRequestService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockImplementation(
      async (callback: (executor: unknown) => unknown) => callback(mocks.trx),
    );
    mocks.findActiveLeaseForTenantRoom.mockResolvedValue({
      tenantInfoId: TENANT_INFO_ID,
      landlordId: LANDLORD_ID,
      roomName: "Room 101",
    });
    mocks.insertMaintenanceRequest.mockResolvedValue(requestRow());
    mocks.insertMaintenancePhotos.mockResolvedValue([]);
    mocks.uploadMaintenancePhoto.mockResolvedValue({
      objectPath: "tenant/request/photo.png",
      fileUrl: "maintenance-photos/tenant/request/photo.png",
    });
    mocks.listMaintenanceRequestsForTenantUser.mockResolvedValue([]);
    mocks.countMaintenanceRequestsForTenantUser.mockResolvedValue(0);
    mocks.findMaintenanceRequestForTenantUser.mockResolvedValue(null);
    mocks.listMaintenanceRequestsForLandlord.mockResolvedValue([]);
    mocks.countMaintenanceRequestsForLandlord.mockResolvedValue(0);
    mocks.findMaintenanceRequestForLandlord.mockResolvedValue(null);
    mocks.findMaintenancePhotosByRequestIds.mockResolvedValue([]);
    mocks.createSignedMaintenancePhotoUrl.mockImplementation(
      async (fileUrl: string) => `https://storage.test/signed/${encodeURIComponent(fileUrl)}`,
    );
    mocks.deleteMaintenancePhoto.mockResolvedValue(undefined);
    mocks.writeAudit.mockResolvedValue(undefined);
    mocks.sendNotification.mockResolvedValue({ sent: true, deduped: false });
  });

  it("US-MAINT-01: creates a Pending request atomically and notifies the owning landlord", async () => {
    const result = await submitMaintenanceRequestService(
      TENANT_USER_ID,
      {
        roomId: ROOM_ID,
        title: "Leaking sink",
        description: "Water is leaking continuously below the sink.",
      },
      [],
    );

    expect(result).toMatchObject({
      roomId: ROOM_ID,
      tenantInfoId: TENANT_INFO_ID,
      status: "Pending",
      photos: [],
    });
    expect(mocks.insertMaintenanceRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        roomId: ROOM_ID,
        tenantInfoId: TENANT_INFO_ID,
        status: "Pending",
      }),
      mocks.trx,
    );
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: TENANT_USER_ID,
        action: "maintenance_request.created",
      }),
      mocks.trx,
    );
    expect(mocks.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: LANDLORD_ID,
        type: "maintenance.created",
        linkRef: `maintenance:${result.id}`,
      }),
    );
  });

  it("US-MAINT-01: refuses a room without an applicable active lease", async () => {
    mocks.findActiveLeaseForTenantRoom.mockResolvedValue(null);

    await expect(
      submitMaintenanceRequestService(
        TENANT_USER_ID,
        { roomId: ROOM_ID, title: "Leak", description: "Detailed leak." },
        [],
      ),
    ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });

    expect(mocks.uploadMaintenancePhoto).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("US-MAINT-01: validates every photo before writing any object", async () => {
    await expect(
      submitMaintenanceRequestService(
        TENANT_USER_ID,
        { roomId: ROOM_ID, title: "Leak", description: "Detailed leak." },
        [photo(), { ...photo("bad.png"), buffer: Buffer.from("invalid") }],
      ),
    ).rejects.toMatchObject({ status: 400, code: "VALIDATION_ERROR" });

    expect(mocks.uploadMaintenancePhoto).not.toHaveBeenCalled();
    expect(mocks.insertMaintenanceRequest).not.toHaveBeenCalled();
  });

  it("US-MAINT-01: stores photo rows in the same database transaction", async () => {
    mocks.insertMaintenancePhotos.mockResolvedValue([
      {
        id: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
        requestId: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
        fileUrl: "maintenance-photos/tenant/request/photo.png",
      },
    ]);

    const result = await submitMaintenanceRequestService(
      TENANT_USER_ID,
      { roomId: ROOM_ID, title: "Leak", description: "Detailed leak." },
      [photo()],
    );

    expect(mocks.uploadMaintenancePhoto).toHaveBeenCalledOnce();
    expect(mocks.insertMaintenancePhotos).toHaveBeenCalledWith(
      [expect.objectContaining({ fileUrl: "maintenance-photos/tenant/request/photo.png" })],
      mocks.trx,
    );
    expect(result.photos).toHaveLength(1);
  });

  it("US-MAINT-01: removes uploaded objects when the database transaction fails", async () => {
    mocks.transaction.mockRejectedValue(new Error("database failed"));

    await expect(
      submitMaintenanceRequestService(
        TENANT_USER_ID,
        { roomId: ROOM_ID, title: "Leak", description: "Detailed leak." },
        [photo()],
      ),
    ).rejects.toThrow("database failed");

    expect(mocks.deleteMaintenancePhoto).toHaveBeenCalledWith(
      "tenant/request/photo.png",
    );
    expect(mocks.sendNotification).not.toHaveBeenCalled();
  });

  it("US-MAINT-01: re-checks the lease in the transaction and compensates a lease race", async () => {
    mocks.findActiveLeaseForTenantRoom
      .mockResolvedValueOnce({
        tenantInfoId: TENANT_INFO_ID,
        landlordId: LANDLORD_ID,
        roomName: "Room 101",
      })
      .mockResolvedValueOnce(null);

    await expect(
      submitMaintenanceRequestService(
        TENANT_USER_ID,
        { roomId: ROOM_ID, title: "Leak", description: "Detailed leak." },
        [photo()],
      ),
    ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });

    expect(mocks.insertMaintenanceRequest).not.toHaveBeenCalled();
    expect(mocks.deleteMaintenancePhoto).toHaveBeenCalledOnce();
  });

  it("keeps the original failure visible when storage compensation also fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.transaction.mockRejectedValue(new Error("database failed"));
    mocks.deleteMaintenancePhoto.mockRejectedValue(new Error("cleanup failed"));

    await expect(
      submitMaintenanceRequestService(
        TENANT_USER_ID,
        { roomId: ROOM_ID, title: "Leak", description: "Detailed leak." },
        [photo()],
      ),
    ).rejects.toThrow("database failed");

    expect(consoleSpy).toHaveBeenCalledWith(
      "[maintenance] failed to clean up uploaded photo",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("US-MAINT-01: removes earlier objects if a later storage upload fails", async () => {
    mocks.uploadMaintenancePhoto
      .mockResolvedValueOnce({
        objectPath: "tenant/request/first.png",
        fileUrl: "maintenance-photos/tenant/request/first.png",
      })
      .mockRejectedValueOnce(new Error("storage failed"));

    await expect(
      submitMaintenanceRequestService(
        TENANT_USER_ID,
        { roomId: ROOM_ID, title: "Leak", description: "Detailed leak." },
        [photo("first.png"), photo("second.png")],
      ),
    ).rejects.toThrow("storage failed");

    expect(mocks.deleteMaintenancePhoto).toHaveBeenCalledWith(
      "tenant/request/first.png",
    );
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("US-MAINT-01: keeps the committed request when notification delivery fails", async () => {
    mocks.sendNotification.mockRejectedValue(new Error("push unavailable"));

    await expect(
      submitMaintenanceRequestService(
        TENANT_USER_ID,
        { roomId: ROOM_ID, title: "Leak", description: "Detailed leak." },
        [],
      ),
    ).resolves.toMatchObject({ status: "Pending" });

    expect(mocks.insertMaintenanceRequest).toHaveBeenCalledOnce();
  });

  it("US-MAINT-02: lists tenant-scoped requests with the current status and signed photos", async () => {
    const row = { ...requestRow({ status: "InProgress" }), roomName: "Room 101" };
    const photoRow = {
      id: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
      requestId: row.id,
      fileUrl: "maintenance-photos/tenant/request/photo.png",
    };
    mocks.listMaintenanceRequestsForTenantUser.mockResolvedValue([row]);
    mocks.countMaintenanceRequestsForTenantUser.mockResolvedValue(1);
    mocks.findMaintenancePhotosByRequestIds.mockResolvedValue([photoRow]);

    const result = await listTenantMaintenanceRequestsService(TENANT_USER_ID, {
      page: 1,
      pageSize: 20,
    });

    expect(result).toEqual({
      data: [
        {
          id: row.id,
          title: row.title,
          description: row.description,
          room: { id: ROOM_ID, name: "Room 101" },
          status: "InProgress",
          submittedAt: "2026-07-22T02:00:00.000Z",
          photos: [
            {
              id: photoRow.id,
              fileUrl:
                "https://storage.test/signed/maintenance-photos%2Ftenant%2Frequest%2Fphoto.png",
            },
          ],
        },
      ],
      meta: { page: 1, pageSize: 20, total: 1 },
    });
    expect(mocks.listMaintenanceRequestsForTenantUser).toHaveBeenCalledWith(
      TENANT_USER_ID,
      { page: 1, pageSize: 20 },
    );
    expect(mocks.findMaintenancePhotosByRequestIds).toHaveBeenCalledWith([row.id]);
  });

  it("US-MAINT-02: opens only an owned request and signs its available photos", async () => {
    const row = { ...requestRow({ status: "Completed" }), roomName: "Room 101" };
    const photoRow = {
      id: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
      requestId: row.id,
      fileUrl: "maintenance-photos/tenant/request/photo.png",
    };
    mocks.findMaintenanceRequestForTenantUser.mockResolvedValue(row);
    mocks.findMaintenancePhotosByRequestIds.mockResolvedValue([photoRow]);

    const result = await getTenantMaintenanceRequestService(TENANT_USER_ID, row.id);

    expect(result).toMatchObject({
      id: row.id,
      status: "Completed",
      room: { id: ROOM_ID, name: "Room 101" },
      photos: [{ id: photoRow.id }],
    });
    expect(mocks.findMaintenanceRequestForTenantUser).toHaveBeenCalledWith(
      TENANT_USER_ID,
      row.id,
    );
    expect(mocks.createSignedMaintenancePhotoUrl).toHaveBeenCalledWith(
      photoRow.fileUrl,
    );
  });

  it("US-MAINT-02: uses a scoped 404 and never reads photos for another tenant's id", async () => {
    await expect(
      getTenantMaintenanceRequestService(
        TENANT_USER_ID,
        "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      ),
    ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });

    expect(mocks.findMaintenancePhotosByRequestIds).not.toHaveBeenCalled();
    expect(mocks.createSignedMaintenancePhotoUrl).not.toHaveBeenCalled();
  });
});

describe("landlord maintenance request reviews (US-MAINT-03)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.listMaintenanceRequestsForLandlord.mockResolvedValue([]);
    mocks.countMaintenanceRequestsForLandlord.mockResolvedValue(0);
    mocks.findMaintenanceRequestForLandlord.mockResolvedValue(null);
    mocks.findMaintenancePhotosByRequestIds.mockResolvedValue([]);
    mocks.createSignedMaintenancePhotoUrl.mockImplementation(
      async (fileUrl: string) =>
        `https://storage.test/signed/${encodeURIComponent(fileUrl)}`,
    );
  });

  function landlordRow(overrides: Record<string, unknown> = {}) {
    return {
      ...requestRow(),
      propertyId: "22222222-2222-4222-8222-222222222222",
      propertyName: "Sunrise House",
      roomName: "Room 101",
      tenantFullName: "Tran Thi B",
      ...overrides,
    };
  }

  it("lists only landlord-owned requests with property/status filters and signed photos", async () => {
    const row = landlordRow({ status: "InProgress" });
    const photoRow = {
      id: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
      requestId: row.id,
      fileUrl: "maintenance-photos/tenant/request/photo.png",
    };
    mocks.listMaintenanceRequestsForLandlord.mockResolvedValue([row]);
    mocks.countMaintenanceRequestsForLandlord.mockResolvedValue(1);
    mocks.findMaintenancePhotosByRequestIds.mockResolvedValue([photoRow]);

    const result = await listMaintenanceRequestsService(
      { id: LANDLORD_ID, role: "Landlord" },
      { page: 1, pageSize: 20 },
      {
        propertyId: "22222222-2222-4222-8222-222222222222",
        status: "InProgress",
      },
    );

    expect(result).toEqual({
      data: [
        {
          id: row.id,
          title: row.title,
          description: row.description,
          property: {
            id: "22222222-2222-4222-8222-222222222222",
            name: "Sunrise House",
          },
          room: { id: ROOM_ID, name: "Room 101" },
          tenant: { id: TENANT_INFO_ID, fullName: "Tran Thi B" },
          status: "InProgress",
          submittedAt: "2026-07-22T02:00:00.000Z",
          photos: [
            {
              id: photoRow.id,
              fileUrl:
                "https://storage.test/signed/maintenance-photos%2Ftenant%2Frequest%2Fphoto.png",
            },
          ],
        },
      ],
      meta: { page: 1, pageSize: 20, total: 1 },
    });
    expect(mocks.listMaintenanceRequestsForLandlord).toHaveBeenCalledWith(
      LANDLORD_ID,
      { page: 1, pageSize: 20 },
      {
        propertyId: "22222222-2222-4222-8222-222222222222",
        status: "InProgress",
      },
    );
    expect(mocks.countMaintenanceRequestsForLandlord).toHaveBeenCalledWith(
      LANDLORD_ID,
      {
        propertyId: "22222222-2222-4222-8222-222222222222",
        status: "InProgress",
      },
    );
  });

  it("opens an owned request with property, room, tenant, description, time, and photos", async () => {
    const row = landlordRow();
    mocks.findMaintenanceRequestForLandlord.mockResolvedValue(row);

    const result = await getMaintenanceRequestService(
      { id: LANDLORD_ID, role: "Landlord" },
      row.id,
    );

    expect(result).toMatchObject({
      id: row.id,
      description: row.description,
      property: { name: "Sunrise House" },
      room: { id: ROOM_ID, name: "Room 101" },
      tenant: { id: TENANT_INFO_ID, fullName: "Tran Thi B" },
      submittedAt: "2026-07-22T02:00:00.000Z",
      status: "Pending",
    });
    expect(mocks.findMaintenanceRequestForLandlord).toHaveBeenCalledWith(
      LANDLORD_ID,
      row.id,
    );
  });

  it("returns scoped 404 and never reads or signs photos for another landlord's request", async () => {
    await expect(
      getMaintenanceRequestService(
        { id: LANDLORD_ID, role: "Landlord" },
        "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      ),
    ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });

    expect(mocks.findMaintenancePhotosByRequestIds).not.toHaveBeenCalled();
    expect(mocks.createSignedMaintenancePhotoUrl).not.toHaveBeenCalled();
  });
});
