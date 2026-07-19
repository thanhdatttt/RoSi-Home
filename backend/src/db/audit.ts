import { db } from "./index.js";
import { auditEvents } from "./schema.js";
import { type PgTable } from "drizzle-orm/pg-core";
import { SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";

export type AuditEntry = {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  beforeValue?: unknown;
  afterValue?: unknown;
};

export async function writeAudit(
  entry: AuditEntry,
  executor: typeof db = db,
): Promise<void> {
  await executor.insert(auditEvents).values({
    actorUserId: entry.actorUserId ?? null,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    beforeValue: entry.beforeValue ?? null,
    afterValue: entry.afterValue ?? null,
  });
}

export async function tx<T>(fn: (trx: typeof db) => Promise<T>): Promise<T> {
  return db.transaction(async (trx) => fn(trx as unknown as typeof db));
}

export async function softDelete(
  table: PgTable,
  idColumn: SQL,
  id: string,
  deletedBy: string,
): Promise<void> {
  await db.execute(sql`UPDATE ${table} SET deleted_at = now(), deleted_by = ${deletedBy} WHERE ${idColumn} = ${id}`);
}
