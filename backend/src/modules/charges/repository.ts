import { and, asc, eq, getTableColumns, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { properties, surcharges } from "../../db/schema.js";
import { findProperty } from "../properties/repository.js";
import { NotFoundError } from "../../lib/errors.js";
import type { CreateSurchargeInput, UpdateSurchargeInput } from "./schema.js";

export type SurchargeRow = typeof surcharges.$inferSelect;

export async function assertPropertyOwned(
  propertyId: string,
  landlordId: string,
): Promise<void> {
  const prop = await findProperty(landlordId, propertyId);
  if (!prop) throw new NotFoundError("Property not found.");
}

export async function createSurcharge(
  propertyId: string,
  createdBy: string,
  input: CreateSurchargeInput,
): Promise<SurchargeRow> {
  const [row] = await db
    .insert(surcharges)
    .values({
      propertyId,
      createdBy,
      name: input.name,
      monthlyAmount: input.monthlyAmount,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    })
    .returning();
  return row;
}

export async function listActiveSurcharges(propertyId: string): Promise<SurchargeRow[]> {
  return db
    .select()
    .from(surcharges)
    .where(
      and(
        eq(surcharges.propertyId, propertyId),
        eq(surcharges.active, true),
        isNull(surcharges.deletedAt),
      ),
    )
    .orderBy(asc(surcharges.name));
}

export async function findActiveSurchargesByName(
  propertyId: string,
  name: string,
): Promise<SurchargeRow[]> {
  return db
    .select()
    .from(surcharges)
    .where(
      and(
        eq(surcharges.propertyId, propertyId),
        eq(surcharges.name, name),
        eq(surcharges.active, true),
        isNull(surcharges.deletedAt),
      ),
    );
}

export async function findSurchargeScoped(
  id: string,
  landlordId: string,
): Promise<SurchargeRow | null> {
  const [row] = await db
    .select({ ...getTableColumns(surcharges) })
    .from(surcharges)
    .innerJoin(properties, eq(surcharges.propertyId, properties.id))
    .where(
      and(
        eq(surcharges.id, id),
        isNull(surcharges.deletedAt),
        eq(properties.landlordId, landlordId),
        isNull(properties.deletedAt),
      ),
    );
  return (row ?? null) as SurchargeRow | null;
}

export async function updateSurcharge(
  id: string,
  input: UpdateSurchargeInput,
): Promise<SurchargeRow | null> {
  const [row] = await db
    .update(surcharges)
    .set(input)
    .where(and(eq(surcharges.id, id), isNull(surcharges.deletedAt)))
    .returning();
  return row ?? null;
}

export async function softDeleteSurcharge(
  id: string,
  deletedBy: string,
): Promise<void> {
  await db
    .update(surcharges)
    .set({ active: false, deletedAt: new Date(), deletedBy })
    .where(and(eq(surcharges.id, id), isNull(surcharges.deletedAt)));
}
