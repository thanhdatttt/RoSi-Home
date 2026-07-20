import { and, asc, count, eq, isNull, sql } from "drizzle-orm";
import { db, type Db } from "../../db/index.js";
import { leases, properties, rooms, tenantInfo, users } from "../../db/schema.js";
import type { Pagination } from "../../lib/pagination.js";
import type { UpdateTenantInput } from "./schema.js";

export type TenantRow = typeof tenantInfo.$inferSelect;

// A tenant_info is in scope for a landlord if it is linked to at least one lease
// in a property the landlord owns (architecture US-TENANT-01).
export function ownedScope(landlordId: string) {
  return sql`
    EXISTS (
      SELECT 1 FROM ${leases} l
      JOIN ${rooms} r ON r.id = l.room_id
      JOIN ${properties} p ON p.id = r.property_id
      WHERE l.tenant_info_id = ${tenantInfo.id}
        AND p.landlord_id = ${landlordId}
        AND p.deleted_at IS NULL
        AND r.deleted_at IS NULL
        AND l.deleted_at IS NULL
    )`;
}

export async function countTenants(landlordId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(tenantInfo)
    .where(and(isNull(tenantInfo.deletedAt), ownedScope(landlordId)));
  return Number(row?.value ?? 0);
}

export async function listTenants(
  landlordId: string,
  p: Pagination,
): Promise<TenantRow[]> {
  return db
    .select()
    .from(tenantInfo)
    .where(and(isNull(tenantInfo.deletedAt), ownedScope(landlordId)))
    .orderBy(asc(tenantInfo.fullName))
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);
}

export async function getTenantScoped(
  landlordId: string,
  id: string,
): Promise<TenantRow | null> {
  const [row] = await db
    .select()
    .from(tenantInfo)
    .where(and(eq(tenantInfo.id, id), isNull(tenantInfo.deletedAt), ownedScope(landlordId)));
  return row ?? null;
}

export async function findTenantById(id: string, executor: Db = db): Promise<TenantRow | null> {
  const [row] = await executor
    .select()
    .from(tenantInfo)
    .where(eq(tenantInfo.id, id));
  return row ?? null;
}

// Returns true if any *active* tenant_info row (other than `id`) already uses
// the given field/value. Mirrors the partial unique indexes on tenant_info.
export async function hasConflictingField(
  id: string,
  field: "phone" | "email" | "idNumber",
  value: string,
): Promise<boolean> {
  const column = tenantInfo[field];
  const [row] = await db
    .select({ id: tenantInfo.id })
    .from(tenantInfo)
    .where(
      and(
        eq(column, value),
        isNull(tenantInfo.deletedAt),
        sql`${tenantInfo.id} <> ${id}`,
      ),
    );
  return !!row;
}

export async function updateTenant(
  id: string,
  fields: UpdateTenantInput,
): Promise<TenantRow | null> {
  const [row] = await db
    .update(tenantInfo)
    .set(fields)
    .where(and(eq(tenantInfo.id, id), isNull(tenantInfo.deletedAt)))
    .returning();
  return row ?? null;
}

export async function softDeleteTenant(
  id: string,
  deletedBy: string,
): Promise<TenantRow | null> {
  const [row] = await db
    .update(tenantInfo)
    .set({ deletedAt: new Date(), deletedBy })
    .where(and(eq(tenantInfo.id, id), isNull(tenantInfo.deletedAt)))
    .returning();
  return row ?? null;
}

export async function findUserByUsername(username: string) {
  return db.query.users.findFirst({ where: eq(users.username, username) });
}

export async function findUserById(id: string) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}
