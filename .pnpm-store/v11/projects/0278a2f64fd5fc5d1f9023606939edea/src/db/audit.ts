import { db } from "./index.js";
import { auditEvents } from "./schema.js";

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
