import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { isUniqueViolation } from "../../lib/pgErrors.js";
import { type Paginated, type Pagination, paginate } from "../../lib/pagination.js";
import { writeAudit } from "../../db/audit.js";
import {
  type CreatePropertyInput,
  type UpdatePropertyInput,
} from "./schema.js";
import {
  createProperty,
  countPropertiesByLandlord,
  findProperty,
  listPropertiesByLandlord,
  updateProperty,
  type PropertyRow,
} from "./repository.js";

export type PropertyView = {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

function serialize(row: PropertyRow): PropertyView {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createPropertyService(
  landlordId: string,
  input: CreatePropertyInput,
): Promise<PropertyView> {
  try {
    const row = await createProperty(landlordId, input);
    await writeAudit({
      actorUserId: landlordId,
      action: "property.created",
      entityType: "properties",
      entityId: row.id,
    });
    return serialize(row);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError("A property with this name or address already exists.");
    }
    throw err;
  }
}

export async function listPropertiesService(
  landlordId: string,
  p: Pagination,
): Promise<Paginated<PropertyView>> {
  const [rows, total] = await Promise.all([
    listPropertiesByLandlord(landlordId, p),
    countPropertiesByLandlord(landlordId),
  ]);
  return paginate(rows.map(serialize), total, p);
}

export async function getPropertyService(
  landlordId: string,
  id: string,
): Promise<PropertyView> {
  const row = await findProperty(landlordId, id);
  if (!row) throw new NotFoundError("Property not found.");
  return serialize(row);
}

export async function updatePropertyService(
  landlordId: string,
  id: string,
  input: UpdatePropertyInput,
): Promise<PropertyView> {
  const existing = await findProperty(landlordId, id);
  if (!existing) throw new NotFoundError("Property not found.");

  try {
    const updated = await updateProperty(landlordId, id, input);
    if (!updated) throw new NotFoundError("Property not found.");
    await writeAudit({
      actorUserId: landlordId,
      action: "property.updated",
      entityType: "properties",
      entityId: id,
      beforeValue: { name: existing.name, address: existing.address },
      afterValue: { name: updated.name, address: updated.address },
    });
    return serialize(updated);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError("A property with this name or address already exists.");
    }
    throw err;
  }
}
