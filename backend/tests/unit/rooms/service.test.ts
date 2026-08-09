import { beforeEach, describe, expect, it, vi } from "vitest";

const LANDLORD_ID = "11111111-1111-4111-8111-111111111111";
const PROPERTY_ID = "22222222-2222-4222-8222-222222222222";
const ROOM_ID = "33333333-3333-4333-8333-333333333333";

const mocks = vi.hoisted(() => ({
  findProperty: vi.fn(),
  createRoom: vi.fn(),
  countRoomsByProperty: vi.fn(),
  listRoomsByProperty: vi.fn(),
  findActiveRoom: vi.fn(),
  findActiveRoomWithStatus: vi.fn(),
  updateRoom: vi.fn(),
  listActiveRoomNames: vi.fn(),
  insertRoomsInTransaction: vi.fn(),
  writeAudit: vi.fn(),
  isUniqueViolation: vi.fn(),
}));

vi.mock("../../../src/modules/properties/repository.js", () => ({
  findProperty: mocks.findProperty,
}));

vi.mock("../../../src/modules/rooms/repository.js", () => ({
  createRoom: mocks.createRoom,
  countRoomsByProperty: mocks.countRoomsByProperty,
  listRoomsByProperty: mocks.listRoomsByProperty,
  findActiveRoom: mocks.findActiveRoom,
  findActiveRoomWithStatus: mocks.findActiveRoomWithStatus,
  updateRoom: mocks.updateRoom,
  listActiveRoomNames: mocks.listActiveRoomNames,
  insertRoomsInTransaction: mocks.insertRoomsInTransaction,
}));

vi.mock("../../../src/db/audit.js", () => ({
  writeAudit: mocks.writeAudit,
}));

vi.mock("../../../src/lib/pgErrors.js", () => ({
  isUniqueViolation: mocks.isUniqueViolation,
}));

import {
  bulkCreateRoomsService,
  createRoomService,
  getRoomService,
  updateRoomService,
} from "../../../src/modules/rooms/service.js";

const now = new Date("2026-07-01T00:00:00.000Z");

const propertyRow = {
  id: PROPERTY_ID,
  landlordId: LANDLORD_ID,
  name: "Sunrise House",
  address: "1 Nguyen Van Cu",
  locality: "Ho Chi Minh City",
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
  deletedBy: null,
};

const roomRow = {
  id: ROOM_ID,
  propertyId: PROPERTY_ID,
  name: "Room 101",
  baseRent: 3_000_000,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
  deletedBy: null,
};

describe("room service ownership and lifecycle rules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findProperty.mockResolvedValue(propertyRow);
    mocks.createRoom.mockResolvedValue(roomRow);
    mocks.findActiveRoom.mockResolvedValue(roomRow);
    mocks.findActiveRoomWithStatus.mockResolvedValue({
      ...roomRow,
      status: "Vacant",
    });
    mocks.updateRoom.mockResolvedValue(roomRow);
    mocks.listActiveRoomNames.mockResolvedValue([]);
    mocks.insertRoomsInTransaction.mockResolvedValue([]);
    mocks.writeAudit.mockResolvedValue(undefined);
    mocks.isUniqueViolation.mockReturnValue(false);
  });

  it("US-ROOM-01: refuses to create a room for a property the landlord does not own", async () => {
    mocks.findProperty.mockResolvedValue(null);

    await expect(
      createRoomService(LANDLORD_ID, PROPERTY_ID, {
        name: "Room 101",
        baseRent: 3_000_000,
      }),
    ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });

    expect(mocks.createRoom).not.toHaveBeenCalled();
  });

  it("US-ROOM-02: returns the occupancy status derived by the repository", async () => {
    mocks.findActiveRoomWithStatus.mockResolvedValue({
      ...roomRow,
      status: "Occupied",
    });

    const result = await getRoomService(LANDLORD_ID, ROOM_ID);

    expect(result.status).toBe("Occupied");
    expect(mocks.findProperty).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
    );
  });

  it("US-ROOM-02: updates editable fields and preserves derived occupancy", async () => {
    const updatedRow = {
      ...roomRow,
      name: "Room 102",
      baseRent: 3_200_000,
    };
    mocks.updateRoom.mockResolvedValue(updatedRow);
    mocks.findActiveRoomWithStatus.mockResolvedValue({
      ...updatedRow,
      status: "Occupied",
    });

    const result = await updateRoomService(LANDLORD_ID, ROOM_ID, {
      name: "Room 102",
      baseRent: 3_200_000,
    });

    expect(result).toMatchObject({
      name: "Room 102",
      baseRent: 3_200_000,
      status: "Occupied",
    });
    expect(mocks.updateRoom).toHaveBeenCalledWith(ROOM_ID, {
      name: "Room 102",
      baseRent: 3_200_000,
    });
    expect(mocks.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: LANDLORD_ID,
        action: "room.updated",
        entityId: ROOM_ID,
      }),
    );
  });

  it("US-ROOM-03: rejects duplicate submitted names before inserting", async () => {
    await expect(
      bulkCreateRoomsService(LANDLORD_ID, PROPERTY_ID, {
        rooms: [
          { name: "Room 101", baseRent: 3_000_000 },
          { name: "Room 101", baseRent: 3_200_000 },
        ],
      }),
    ).rejects.toMatchObject({
      status: 422,
      code: "UNPROCESSABLE",
      fields: [
        {
          field: "rooms[1].name",
          message: "Duplicate room name in request.",
        },
      ],
    });

    expect(mocks.insertRoomsInTransaction).not.toHaveBeenCalled();
  });

  it("US-ROOM-03: auto-numbers and inserts the whole batch through one transaction boundary", async () => {
    mocks.listActiveRoomNames.mockResolvedValue(["Room 1", "Room 3"]);
    mocks.insertRoomsInTransaction.mockImplementation(async (records) =>
      records.map((record: typeof roomRow, index: number) => ({
        ...roomRow,
        ...record,
        id:
          index === 0
            ? "44444444-4444-4444-8444-444444444444"
            : "55555555-5555-4555-8555-555555555555",
      })),
    );

    const result = await bulkCreateRoomsService(
      LANDLORD_ID,
      PROPERTY_ID,
      {
        rooms: [{ baseRent: 3_000_000 }, { baseRent: 3_200_000 }],
      },
    );

    expect(mocks.insertRoomsInTransaction).toHaveBeenCalledOnce();
    expect(mocks.insertRoomsInTransaction).toHaveBeenCalledWith([
      {
        propertyId: PROPERTY_ID,
        name: "Room 4",
        baseRent: 3_000_000,
      },
      {
        propertyId: PROPERTY_ID,
        name: "Room 5",
        baseRent: 3_200_000,
      },
    ]);
    expect(result.created.map((room) => room.status)).toEqual([
      "Vacant",
      "Vacant",
    ]);
  });
});
