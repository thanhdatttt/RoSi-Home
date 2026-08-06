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
  upsertUpcomingSurcharge,
  findActiveSurchargesByName,
  findSurchargeScoped,
  listActiveSurcharges,
  lockSurchargeName,
  renameSurchargeGroup,
  softDeleteSurcharge,
  updateSurcharge,
  findOverlappingSurcharges,
  type SurchargeRow,
} from "./repository.js";
import type { CreateSurchargeInput, UpdateSurchargeInput } from "./schema.js";
import { assertSurchargePeriod, rangesOverlap } from "./rules.js";
import { businessDate } from "../../lib/businessDate.js";

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

  const overlaps = await findOverlappingSurcharges(
    propertyId,
    input.name,
    input.effectiveFrom,
    input.effectiveTo ?? null
  );

  if (overlaps.length > 0) {
    throw new ConflictError(`This conflicts with an existing rate for '${input.name}'. Please end the active rate before scheduling a new one for this period.`);
  }

  return db.transaction(async (rawTrx) => {
    const trx = rawTrx as unknown as typeof db;
    const row = await upsertUpcomingSurcharge(propertyId, landlordId, input, businessDate(), trx);
    await writeAudit(
      {
        actorUserId: landlordId,
        action: "surcharge.upserted",
        entityType: "surcharges",
        entityId: row.id,
      },
      trx,
    );
    return serialize(row);
  });
}

export type GroupedSurchargeView = {
  name: string;
  current: SurchargeView | null;
  upcoming: SurchargeView | null;
};

export async function listSurchargesService(
  landlordId: string,
  propertyId: string,
  p: Pagination,
): Promise<Paginated<GroupedSurchargeView>> {
  await assertPropertyOwned(propertyId, landlordId);
  const rows = await listActiveSurcharges(propertyId);
  
  const groups: Record<string, GroupedSurchargeView> = {};
  const today = businessDate();

  for (const row of rows) {
    if (!groups[row.name]) {
      groups[row.name] = { name: row.name, current: null, upcoming: null };
    }
    const view = serialize(row);
    if (view.effectiveFrom > today) {
      // It's strictly in the future => upcoming
      if (!groups[row.name].upcoming || view.createdAt > groups[row.name].upcoming!.createdAt) {
        groups[row.name].upcoming = view;
      }
    } else {
      // It's past or present => current
      if (!groups[row.name].current || view.effectiveFrom > groups[row.name].current!.effectiveFrom) {
        groups[row.name].current = view;
      }
    }
  }

  const resultList = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  const total = resultList.length;
  
  const paginatedList = resultList.slice((p.page - 1) * p.pageSize, p.page * p.pageSize);

  return paginate(paginatedList, total, p);
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

    const finalName = input.name ?? existing.name;
    const finalFrom = input.effectiveFrom ?? existing.effectiveFrom;
    
    // Check if effectiveTo is provided in the input, even if it is null
    const finalTo = input.effectiveTo !== undefined ? input.effectiveTo : existing.effectiveTo;

    assertSurchargePeriod(finalFrom, finalTo);

    const overlaps = await findOverlappingSurcharges(
      existing.propertyId,
      finalName,
      finalFrom,
      finalTo,
      id,
      trx
    );

    if (overlaps.length > 0) {
      throw new ConflictError(`This conflicts with another rate for '${finalName}'. Please adjust the dates so they do not overlap.`);
    }

    if (input.name && input.name !== existing.name) {
      // User is renaming the surcharge. Update ALL records with the old name for this property to keep them grouped together.
      await renameSurchargeGroup(existing.propertyId, existing.name, input.name, trx);
    }

    const row = await updateSurcharge(
      id,
      {
        name: input.name,
        monthlyAmount: input.monthlyAmount,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo,
      },
      trx,
    );

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
    return serialize(row!);
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
