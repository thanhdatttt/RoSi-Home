import { ConflictError, NotFoundError, UnprocessableError } from "../../lib/errors.js";
import { isUniqueViolation } from "../../lib/pgErrors.js";
import { type Paginated, type Pagination, paginate } from "../../lib/pagination.js";
import { writeAudit } from "../../db/audit.js";
import { findProperty } from "../properties/repository.js";
import {
  type CreateRoomInput,
  type UpdateRoomInput,
  type BulkRoomsInput,
} from "./schema.js";
import {
  createRoom,
  countRoomsByProperty,
  listRoomsByProperty,
  findActiveRoom,
  findActiveRoomWithStatus,
  updateRoom,
  listActiveRoomNames,
  insertRoomsInTransaction,
  type RoomRow,
  type RoomWithStatus,
} from "./repository.js";

export type RoomView = {
  id: string;
  propertyId: string;
  name: string;
  baseRent: number;
  status: "Vacant" | "Occupied";
  createdAt: string;
  updatedAt: string;
};

function serialize(row: RoomRow, status: "Vacant" | "Occupied"): RoomView {
  return {
    id: row.id,
    propertyId: row.propertyId,
    name: row.name,
    baseRent: row.baseRent,
    status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function assertPropertyOwned(propertyId: string, landlordId: string): Promise<void> {
  const prop = await findProperty(landlordId, propertyId);
  if (!prop) throw new NotFoundError("Property not found.");
}

export async function createRoomService(
  landlordId: string,
  propertyId: string,
  input: CreateRoomInput,
): Promise<RoomView> {
  await assertPropertyOwned(propertyId, landlordId);
  try {
    const row = await createRoom(propertyId, input);
    await writeAudit({
      actorUserId: landlordId,
      action: "room.created",
      entityType: "rooms",
      entityId: row.id,
    });
    return serialize(row, "Vacant");
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError("A room with this name already exists in the property.");
    }
    throw err;
  }
}

export async function listRoomsService(
  landlordId: string,
  propertyId: string,
  p: Pagination,
): Promise<Paginated<RoomView>> {
  await assertPropertyOwned(propertyId, landlordId);
  const [rows, total] = await Promise.all([
    listRoomsByProperty(propertyId, p),
    countRoomsByProperty(propertyId),
  ]);
  return paginate(rows.map((r) => serialize(r, r.status)), total, p);
}

export async function getRoomService(
  landlordId: string,
  roomId: string,
): Promise<RoomView> {
  const withStatus = await findActiveRoomWithStatus(roomId);
  if (!withStatus) throw new NotFoundError("Room not found.");
  await assertPropertyOwned(withStatus.propertyId, landlordId);
  return serialize(withStatus, withStatus.status);
}

export async function updateRoomService(
  landlordId: string,
  roomId: string,
  input: UpdateRoomInput,
): Promise<RoomView> {
  const room = await findActiveRoom(roomId);
  if (!room) throw new NotFoundError("Room not found.");
  await assertPropertyOwned(room.propertyId, landlordId);

  try {
    const updated = await updateRoom(roomId, input);
    if (!updated) throw new NotFoundError("Room not found.");
    await writeAudit({
      actorUserId: landlordId,
      action: "room.updated",
      entityType: "rooms",
      entityId: roomId,
      beforeValue: { name: room.name, baseRent: room.baseRent },
      afterValue: { name: updated.name, baseRent: updated.baseRent },
    });
    return serialize(updated, (await findActiveRoomWithStatus(roomId))?.status ?? "Vacant");
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError("A room with this name already exists in the property.");
    }
    throw err;
  }
}

function maxNumericSuffix(names: string[]): number {
  let max = 0;
  for (const n of names) {
    const m = /^Room (\d+)$/.exec(n.trim());
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

export async function bulkCreateRoomsService(
  landlordId: string,
  propertyId: string,
  input: BulkRoomsInput,
): Promise<{ created: RoomView[] }> {
  await assertPropertyOwned(propertyId, landlordId);
  const existingNames = await listActiveRoomNames(propertyId);
  const existingSet = new Set(existingNames.map((n) => n.trim()));
  const errors: { field: string; message: string }[] = [];
  let counter = maxNumericSuffix(existingNames);
  const finalNames: string[] = [];

  input.rooms.forEach((r, i) => {
    if (r.name) {
      finalNames.push(r.name.trim());
    } else {
      counter += 1;
      finalNames.push(`Room ${counter}`);
    }
  });

  const seen = new Set<string>();
  finalNames.forEach((name, i) => {
    if (seen.has(name)) {
      errors.push({ field: `rooms[${i}].name`, message: "Duplicate room name in request." });
    } else {
      seen.add(name);
    }
    if (existingSet.has(name)) {
      errors.push({
        field: `rooms[${i}].name`,
        message: "A room with this name already exists in the property.",
      });
    }
  });

  if (errors.length > 0) {
    throw new UnprocessableError("One or more rooms are invalid.", errors);
  }

  try {
    const rows = await insertRoomsInTransaction(
      finalNames.map((name, i) => ({
        propertyId,
        name,
        baseRent: input.rooms[i].baseRent,
      })),
    );
    await writeAudit({
      actorUserId: landlordId,
      action: "rooms.bulkCreated",
      entityType: "properties",
      entityId: propertyId,
      afterValue: { count: rows.length },
    });
    return { created: rows.map((r) => serialize(r, "Vacant")) };
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError("A room with this name already exists in the property.");
    }
    throw err;
  }
}
