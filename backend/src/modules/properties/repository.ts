import { and, count, eq, isNull, asc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { properties } from "../../db/schema.js";
import type { Pagination } from "../../lib/pagination.js";
import type { CreatePropertyInput, UpdatePropertyInput } from "./schema.js";

export type PropertyRow = typeof properties.$inferSelect;

export async function createProperty(
  landlordId: string,
  input: CreatePropertyInput,
): Promise<PropertyRow> {
  const [row] = await db
    .insert(properties)
    .values({ landlordId, name: input.name, address: input.address })
    .returning();
  return row;
}

export async function countPropertiesByLandlord(landlordId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(properties)
    .where(and(eq(properties.landlordId, landlordId), isNull(properties.deletedAt)));
  return Number(row?.value ?? 0);
}

export async function listPropertiesByLandlord(
  landlordId: string,
  p: Pagination,
): Promise<PropertyRow[]> {
  return db
    .select()
    .from(properties)
    .where(and(eq(properties.landlordId, landlordId), isNull(properties.deletedAt)))
    .orderBy(asc(properties.name))
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);
}

export async function findProperty(
  landlordId: string,
  id: string,
): Promise<PropertyRow | null> {
  const [row] = await db
    .select()
    .from(properties)
    .where(
      and(eq(properties.id, id), eq(properties.landlordId, landlordId), isNull(properties.deletedAt)),
    );
  return row ?? null;
}

export async function updateProperty(
  landlordId: string,
  id: string,
  input: UpdatePropertyInput,
): Promise<PropertyRow | null> {
  const [row] = await db
    .update(properties)
    .set(input)
    .where(
      and(eq(properties.id, id), eq(properties.landlordId, landlordId), isNull(properties.deletedAt)),
    )
    .returning();
  return row ?? null;
}
