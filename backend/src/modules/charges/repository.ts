import { and, asc, count, eq, getTableColumns, isNull, sql } from "drizzle-orm";
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
  executor: typeof db = db,
): Promise<SurchargeRow> {
  const [row] = await executor
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

export async function listActiveSurcharges(
  propertyId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<SurchargeRow[]> {
  const base = db
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
  if (options.limit !== undefined || options.offset !== undefined) {
    return base
      .limit(options.limit ?? Number.MAX_SAFE_INTEGER)
      .offset(options.offset ?? 0);
  }
  return base;
}

export async function countActiveSurcharges(propertyId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(surcharges)
    .where(
      and(
        eq(surcharges.propertyId, propertyId),
        eq(surcharges.active, true),
        isNull(surcharges.deletedAt),
      ),
    );
  return Number(row?.value ?? 0);
}

// Active surcharges whose effective window overlaps the billing period
// (inclusive range; null effectiveTo means open-ended).
export async function findActiveSurchargesForPropertyPeriod(
  propertyId: string,
  periodStart: string,
  periodEnd: string,
  executor: typeof db = db,
): Promise<SurchargeRow[]> {
  return executor
    .select()
    .from(surcharges)
    .where(
      and(
        eq(surcharges.propertyId, propertyId),
        eq(surcharges.active, true),
        isNull(surcharges.deletedAt),
        sql`${surcharges.effectiveFrom} <= ${periodEnd}`,
        sql`(${surcharges.effectiveTo} IS NULL OR ${surcharges.effectiveTo} >= ${periodStart})`,
      ),
    )
    .orderBy(asc(surcharges.name));
}

export async function findActiveSurchargesByName(
  propertyId: string,
  name: string,
  executor: typeof db = db,
): Promise<SurchargeRow[]> {
  return executor
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

export async function lockSurchargeName(
  propertyId: string,
  name: string,
  executor: typeof db = db,
): Promise<void> {
  const lockKey = `${propertyId}:${name}`;
  await executor.execute(
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`,
  );
}

export async function findSurchargeScoped(
  id: string,
  landlordId: string,
  executor: typeof db = db,
): Promise<SurchargeRow | null> {
  const [row] = await executor
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
  executor: typeof db = db,
): Promise<SurchargeRow | null> {
  const [row] = await executor
    .update(surcharges)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(surcharges.id, id), isNull(surcharges.deletedAt)))
    .returning();
  return row ?? null;
}

export async function softDeleteSurcharge(
  id: string,
  deletedBy: string,
  executor: typeof db = db,
): Promise<void> {
  await executor
    .update(surcharges)
    .set({
      active: false,
      deletedAt: new Date(),
      deletedBy,
      updatedAt: new Date(),
    })
    .where(and(eq(surcharges.id, id), isNull(surcharges.deletedAt)));
}
