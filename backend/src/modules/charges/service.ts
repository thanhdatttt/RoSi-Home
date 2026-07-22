import {
  ConflictError,
  NotFoundError,
} from "../../lib/errors.js";
import { type Paginated, type Pagination, paginate } from "../../lib/pagination.js";
import { toDateStr } from "../../lib/serialize.js";
import { writeAudit } from "../../db/audit.js";
import { db } from "../../db/index.js";
import {
  assertPropertyOwned,
  countActiveSurcharges,
  createSurcharge,
  findActiveSurchargesByName,
  findSurchargeScoped,
  listActiveSurcharges,
  lockSurchargeName,
  softDeleteSurcharge,
  updateSurcharge,
  type SurchargeRow,
} from "./repository.js";
import type { CreateSurchargeInput, UpdateSurchargeInput } from "./schema.js";
import { assertSurchargePeriod, rangesOverlap } from "./rules.js";

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
  assertSurchargePeriod(input.effectiveFrom, input.effectiveTo ?? null);

  return db.transaction(async (rawTrx) => {
    const trx = rawTrx as unknown as typeof db;
    await lockSurchargeName(propertyId, input.name, trx);
    const sameName = await findActiveSurchargesByName(
      propertyId,
      input.name,
      trx,
    );
    for (const surcharge of sameName) {
      if (
        rangesOverlap(
          input.effectiveFrom,
          input.effectiveTo ?? null,
          toDateStr(surcharge.effectiveFrom)!,
          toDateStr(surcharge.effectiveTo),
        )
      ) {
        throw new ConflictError(
          "An active surcharge with this name already covers an overlapping period.",
        );
      }
    }

    const row = await createSurcharge(propertyId, landlordId, input, trx);
    await writeAudit(
      {
        actorUserId: landlordId,
        action: "surcharge.created",
        entityType: "surcharges",
        entityId: row.id,
      },
      trx,
    );
    return serialize(row);
  });
}

export async function listSurchargesService(
  landlordId: string,
  propertyId: string,
  p: Pagination,
): Promise<Paginated<SurchargeView>> {
  await assertPropertyOwned(propertyId, landlordId);
  const total = await countActiveSurcharges(propertyId);
  const rows = await listActiveSurcharges(propertyId, {
    limit: p.pageSize,
    offset: (p.page - 1) * p.pageSize,
  });
  return paginate(rows.map(serialize), total, p);
}

export async function updateSurchargeService(
  landlordId: string,
  id: string,
  input: UpdateSurchargeInput,
): Promise<SurchargeView> {
  return db.transaction(async (rawTrx) => {
    const trx = rawTrx as unknown as typeof db;
    const existing = await findSurchargeScoped(id, landlordId, trx);
    if (!existing) throw new NotFoundError("Surcharge not found.");

    const newName = input.name ?? existing.name;
    const newFrom = input.effectiveFrom ?? toDateStr(existing.effectiveFrom)!;
    const newTo =
      input.effectiveTo !== undefined
        ? input.effectiveTo
        : toDateStr(existing.effectiveTo);
    assertSurchargePeriod(newFrom, newTo);

    if (
      input.name !== undefined ||
      input.effectiveFrom !== undefined ||
      input.effectiveTo !== undefined
    ) {
      await lockSurchargeName(existing.propertyId, newName, trx);
      const sameName = await findActiveSurchargesByName(
        existing.propertyId,
        newName,
        trx,
      );
      for (const surcharge of sameName) {
        if (surcharge.id === id) continue;
        if (
          rangesOverlap(
            newFrom,
            newTo,
            toDateStr(surcharge.effectiveFrom)!,
            toDateStr(surcharge.effectiveTo),
          )
        ) {
          throw new ConflictError(
            "An active surcharge with this name already covers an overlapping period.",
          );
        }
      }
    }

    const updated = await updateSurcharge(id, input, trx);
    if (!updated) throw new NotFoundError("Surcharge not found.");
    await writeAudit(
      {
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
      },
      trx,
    );
    return serialize(updated);
  });
}

export async function deleteSurchargeService(
  landlordId: string,
  id: string,
): Promise<{ success: true }> {
  return db.transaction(async (rawTrx) => {
    const trx = rawTrx as unknown as typeof db;
    const existing = await findSurchargeScoped(id, landlordId, trx);
    if (!existing) throw new NotFoundError("Surcharge not found.");

    await softDeleteSurcharge(id, landlordId, trx);
    await writeAudit(
      {
        actorUserId: landlordId,
        action: "surcharge.deleted",
        entityType: "surcharges",
        entityId: id,
      },
      trx,
    );
    return { success: true };
  });
}
