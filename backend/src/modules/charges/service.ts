import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { type Paginated, type Pagination, paginate } from "../../lib/pagination.js";
import { writeAudit } from "../../db/audit.js";
import {
  assertPropertyOwned,
  createSurcharge,
  findActiveSurchargesByName,
  findSurchargeScoped,
  listActiveSurcharges,
  softDeleteSurcharge,
  updateSurcharge,
  type SurchargeRow,
} from "./repository.js";
import type { CreateSurchargeInput, UpdateSurchargeInput } from "./schema.js";

export type SurchargeView = {
  id: string;
  propertyId: string;
  name: string;
  monthlyAmount: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

function toDateStr(d: Date | string | null | undefined): string | null {
  if (d === null || d === undefined) return null;
  if (typeof d === "string") return d;
  return d.toISOString().slice(0, 10);
}

// Two [start, end] ranges overlap when each starts before or on the other's end.
// A null end means "+infinity".
function rangesOverlap(
  s1: string,
  e1: string | null,
  s2: string,
  e2: string | null,
): boolean {
  const end1 = e1 ?? "9999-12-31";
  const end2 = e2 ?? "9999-12-31";
  return s1 <= end2 && s2 <= end1;
}

function serialize(row: SurchargeRow): SurchargeView {
  return {
    id: row.id,
    propertyId: row.propertyId,
    name: row.name,
    monthlyAmount: row.monthlyAmount,
    effectiveFrom: toDateStr(row.effectiveFrom)!,
    effectiveTo: toDateStr(row.effectiveTo),
    active: row.active,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createSurchargeService(
  landlordId: string,
  propertyId: string,
  input: CreateSurchargeInput,
): Promise<SurchargeView> {
  await assertPropertyOwned(propertyId, landlordId);
  const sameName = await findActiveSurchargesByName(propertyId, input.name);
  for (const s of sameName) {
    if (
      rangesOverlap(
        input.effectiveFrom,
        input.effectiveTo ?? null,
        toDateStr(s.effectiveFrom)!,
        toDateStr(s.effectiveTo),
      )
    ) {
      throw new ConflictError(
        "An active surcharge with this name already covers an overlapping period.",
      );
    }
  }
  const row = await createSurcharge(propertyId, landlordId, input);
  await writeAudit({
    actorUserId: landlordId,
    action: "surcharge.created",
    entityType: "surcharges",
    entityId: row.id,
  });
  return serialize(row);
}

export async function listSurchargesService(
  landlordId: string,
  propertyId: string,
  p: Pagination,
): Promise<Paginated<SurchargeView>> {
  await assertPropertyOwned(propertyId, landlordId);
  const rows = await listActiveSurcharges(propertyId);
  const total = rows.length;
  const start = (p.page - 1) * p.pageSize;
  const pageRows = rows.slice(start, start + p.pageSize);
  return paginate(pageRows.map(serialize), total, p);
}

export async function updateSurchargeService(
  landlordId: string,
  id: string,
  input: UpdateSurchargeInput,
): Promise<SurchargeView> {
  const existing = await findSurchargeScoped(id, landlordId);
  if (!existing) throw new NotFoundError("Surcharge not found.");

  const newName = input.name ?? existing.name;
  const newFrom = input.effectiveFrom ?? toDateStr(existing.effectiveFrom)!;
  const newTo = input.effectiveTo !== undefined ? input.effectiveTo : toDateStr(existing.effectiveTo);

  // Re-validate uniqueness only when the name or period actually changes.
  if (
    input.name !== undefined ||
    input.effectiveFrom !== undefined ||
    input.effectiveTo !== undefined
  ) {
    const sameName = await findActiveSurchargesByName(existing.propertyId, newName);
    for (const s of sameName) {
      if (s.id === id) continue;
      if (
        rangesOverlap(newFrom, newTo ?? null, toDateStr(s.effectiveFrom)!, toDateStr(s.effectiveTo))
      ) {
        throw new ConflictError(
          "An active surcharge with this name already covers an overlapping period.",
        );
      }
    }
  }

  const updated = await updateSurcharge(id, input);
  if (!updated) throw new NotFoundError("Surcharge not found.");
  await writeAudit({
    actorUserId: landlordId,
    action: "surcharge.updated",
    entityType: "surcharges",
    entityId: id,
    beforeValue: {
      name: existing.name,
      monthlyAmount: existing.monthlyAmount,
      effectiveFrom: toDateStr(existing.effectiveFrom),
      effectiveTo: toDateStr(existing.effectiveTo),
    },
    afterValue: input,
  });
  return serialize(updated);
}

export async function deleteSurchargeService(
  landlordId: string,
  id: string,
): Promise<{ success: true }> {
  const existing = await findSurchargeScoped(id, landlordId);
  if (!existing) throw new NotFoundError("Surcharge not found.");
  // Soft delete (prospective deactivation) + audit of responsible landlord/time.
  await softDeleteSurcharge(id, landlordId);
  await writeAudit({
    actorUserId: landlordId,
    action: "surcharge.deleted",
    entityType: "surcharges",
    entityId: id,
  });
  return { success: true };
}
