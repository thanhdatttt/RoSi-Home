import { db, type Db } from "../../db/index.js";
import { writeAudit } from "../../db/audit.js";
import { ConflictError, NotFoundError, UnprocessableError } from "../../lib/errors.js";
import { isUniqueViolation } from "../../lib/pgErrors.js";
import { businessDate } from "../../lib/businessDate.js";
import { type Paginated, type Pagination, paginate } from "../../lib/pagination.js";
import { provisionTenantAccount } from "../tenants/service.js";
import {
  assertLeasePeriod,
  rangesOverlap,
  addDays,
  UPCOMING_EXPIRATION_WINDOW_DAYS,
} from "./rules.js";
import {
  assertPropertyOwnedByLandlord,
  assertRoomOwnedByLandlord,
  countLeasesForLandlord,
  countLeasesForTenantUser,
  createTenantInfo,
  endLeaseRow,
  findActiveLeasesForRoom,
  findActiveTenantByIdNumber,
  findConflictingTenantField,
  findConflictingUsername,
  findLeaseForLandlord,
  findLeaseForTenantUser,
  findLeaseReminderConfig,
  findUpcomingExpirationsForLandlord,
  insertLease,
  listLeasesForLandlord,
  listLeasesForTenantUser,
  lockRoomForLeaseWrite,
  updateLeaseRow,
  upsertLeaseReminderConfig,
  type LeaseDetailRow,
  type LeaseReminderConfigRow,
} from "./repository.js";
import type {
  CreateLeaseInput,
  LeaseReminderConfigInput,
  UpdateLeaseInput,
} from "./schema.js";

export type LeaseView = {
  id: string;
  roomId: string;
  roomName: string;
  propertyId: string;
  propertyName: string;
  tenantInfoId: string;
  tenantId: string | null;
  tenant: { fullName: string; phone: string; email: string };
  startDate: string;
  endDate: string;
  actualEndDate: string | null;
  agreedRent: number;
  deposit: number;
  status: "Active" | "Ended" | "Expired";
  createdBy: string;
  endedBy: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpcomingExpirationView = {
  leaseId: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  tenantFullName: string;
  endDate: string;
};

export type LeaseReminderConfigView = {
  propertyId: string;
  remindAt30Days: boolean;
  remindAt15Days: boolean;
  remindAt7Days: boolean;
};

function toDateStr(d: Date | string | null | undefined): string | null {
  if (d === null || d === undefined) return null;
  if (typeof d === "string") return d;
  return d.toISOString().slice(0, 10);
}

function serialize(row: LeaseDetailRow): LeaseView {
  return {
    id: row.id,
    roomId: row.roomId,
    roomName: row.roomName,
    propertyId: row.propertyId,
    propertyName: row.propertyName,
    tenantInfoId: row.tenantInfoId,
    tenantId: row.tenantUserId,
    tenant: { fullName: row.tenantFullName, phone: row.tenantPhone, email: row.tenantEmail },
    startDate: toDateStr(row.startDate)!,
    endDate: toDateStr(row.endDate)!,
    actualEndDate: toDateStr(row.actualEndDate),
    agreedRent: row.agreedRent,
    deposit: row.deposit,
    status: row.status,
    createdBy: row.createdBy,
    endedBy: row.endedBy,
    endedAt: row.endedAt ? row.endedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function serializeReminderConfig(
  propertyId: string,
  row: LeaseReminderConfigRow | null,
): LeaseReminderConfigView {
  return {
    propertyId,
    remindAt30Days: row?.remindAt30Days ?? false,
    remindAt15Days: row?.remindAt15Days ?? false,
    remindAt7Days: row?.remindAt7Days ?? false,
  };
}

async function assertNoOverlap(
  roomId: string,
  startDate: string,
  endDate: string,
  excludeLeaseId: string | undefined,
  trx: Db,
): Promise<void> {
  const activeLeases = await findActiveLeasesForRoom(roomId, trx, excludeLeaseId);
  const overlap = activeLeases.some((l) =>
    rangesOverlap(startDate, endDate, toDateStr(l.startDate)!, toDateStr(l.endDate)!),
  );
  if (overlap) {
    throw new ConflictError("This room already has an active lease covering that period.");
  }
}

// US-LEASE-01 — the highest-risk transaction in the system: creates/reuses
// tenant_info, creates the lease, and provisions the tenant account
// atomically (architecture §4.4). Retryable: a flaky email send inside
// provisionTenantAccount never rolls this transaction back.
export async function createLeaseService(
  landlordId: string,
  input: CreateLeaseInput,
): Promise<{ lease: LeaseView; tenantAccountProvisioned: boolean }> {
  await assertRoomOwnedByLandlord(input.roomId, landlordId);
  assertLeasePeriod(input.startDate, input.endDate);

  try {
    return await db.transaction(async (rawTrx) => {
      const trx = rawTrx as unknown as Db;
      await lockRoomForLeaseWrite(input.roomId, trx);

      await assertNoOverlap(input.roomId, input.startDate, input.endDate, undefined, trx);

      // Returning tenant: match by idNumber first and reuse the existing
      // tenant_info record instead of erroring or duplicating.
      const existingTenant = await findActiveTenantByIdNumber(input.tenant.idNumber, trx);

      if (
        await findConflictingTenantField("phone", input.tenant.phone, existingTenant?.id ?? null, trx)
      ) {
        throw new ConflictError("This phone number is already used by another tenant.");
      }
      if (
        await findConflictingTenantField("email", input.tenant.email, existingTenant?.id ?? null, trx)
      ) {
        throw new ConflictError("This email is already used by another tenant.");
      }
      if (
        await findConflictingUsername(input.tenant.phone, existingTenant?.userId ?? null, trx)
      ) {
        throw new ConflictError("This phone number is already used as a login username.");
      }

      const tenantRow = existingTenant ?? (await createTenantInfo(landlordId, input.tenant, trx));

      const lease = await insertLease(
        {
          roomId: input.roomId,
          tenantInfoId: tenantRow.id,
          startDate: input.startDate,
          endDate: input.endDate,
          agreedRent: input.agreedRent,
          deposit: input.deposit,
          createdBy: landlordId,
        },
        trx,
      );

      const { provisioned } = await provisionTenantAccount(
        {
          id: tenantRow.id,
          fullName: tenantRow.fullName,
          phone: tenantRow.phone,
          email: tenantRow.email,
        },
        trx,
      );

      await writeAudit(
        {
          actorUserId: landlordId,
          action: "lease.created",
          entityType: "leases",
          entityId: lease.id,
          afterValue: {
            roomId: lease.roomId,
            tenantInfoId: lease.tenantInfoId,
            startDate: input.startDate,
            endDate: input.endDate,
          },
        },
        trx,
      );

      const detail = await findLeaseForLandlord(landlordId, lease.id, trx);
      return { lease: serialize(detail!), tenantAccountProvisioned: provisioned };
    });
  } catch (err) {
    // Second line of defense: leases_tenant_active (one Active lease per
    // tenant system-wide) and other unique constraints.
    if (isUniqueViolation(err)) {
      throw new ConflictError(
        "This tenant already has an active lease, or this room already has an overlapping active lease.",
      );
    }
    throw err;
  }
}

export async function getLeaseService(
  user: { id: string; role: "Landlord" | "Tenant" },
  leaseId: string,
): Promise<LeaseView> {
  const row =
    user.role === "Landlord"
      ? await findLeaseForLandlord(user.id, leaseId)
      : await findLeaseForTenantUser(user.id, leaseId);
  if (!row) throw new NotFoundError("Lease not found.");
  return serialize(row);
}

export async function listLeasesService(
  user: { id: string; role: "Landlord" | "Tenant" },
  p: Pagination,
  propertyId?: string,
): Promise<Paginated<LeaseView>> {
  if (user.role === "Landlord") {
    const [rows, total] = await Promise.all([
      listLeasesForLandlord(user.id, p, propertyId),
      countLeasesForLandlord(user.id, propertyId),
    ]);
    return paginate(rows.map(serialize), total, p);
  }
  const [rows, total] = await Promise.all([
    listLeasesForTenantUser(user.id, p),
    countLeasesForTenantUser(user.id),
  ]);
  return paginate(rows.map(serialize), total, p);
}

// US-LEASE-03 — plain edit branch: endDate/agreedRent/deposit on the
// existing row, revalidated with the same rules as creation.
async function applyPlainUpdate(
  landlordId: string,
  existing: LeaseDetailRow,
  input: UpdateLeaseInput,
): Promise<LeaseView> {
  if (existing.status !== "Active") {
    throw new UnprocessableError("Only an Active lease can be updated.", [
      { field: "status", message: "Lease is not Active." },
    ]);
  }
  const newEndDate = input.endDate ?? toDateStr(existing.endDate)!;
  assertLeasePeriod(toDateStr(existing.startDate)!, newEndDate);

  return db.transaction(async (rawTrx) => {
    const trx = rawTrx as unknown as Db;
    await lockRoomForLeaseWrite(existing.roomId, trx);
    if (input.endDate !== undefined) {
      await assertNoOverlap(existing.roomId, toDateStr(existing.startDate)!, newEndDate, existing.id, trx);
    }

    const beforeValue = { endDate: toDateStr(existing.endDate), agreedRent: existing.agreedRent, deposit: existing.deposit };
    const updated = await updateLeaseRow(
      existing.id,
      {
        ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
        ...(input.agreedRent !== undefined ? { agreedRent: input.agreedRent } : {}),
        ...(input.deposit !== undefined ? { deposit: input.deposit } : {}),
      },
      trx,
    );
    if (!updated) throw new NotFoundError("Lease not found.");

    await writeAudit(
      {
        actorUserId: landlordId,
        action: "lease.updated",
        entityType: "leases",
        entityId: existing.id,
        beforeValue,
        afterValue: { endDate: newEndDate, agreedRent: updated.agreedRent, deposit: updated.deposit },
      },
      trx,
    );

    const detail = await findLeaseForLandlord(landlordId, existing.id, trx);
    return serialize(detail!);
  });
}

// US-LEASE-03 — renewal branch: end the current row and create a new
// `Active` lease row linked to the same tenant_info + room, preserving
// history so past invoices still resolve to the correct lease period.
async function applyRenewal(
  landlordId: string,
  existing: LeaseDetailRow,
  input: UpdateLeaseInput,
): Promise<LeaseView> {
  if (existing.status !== "Active") {
    throw new UnprocessableError("Only an Active lease can be renewed.", [
      { field: "status", message: "Lease is not Active." },
    ]);
  }
  const renewalStartDate = input.renewalStartDate!;
  const renewalEndDate = input.renewalEndDate!;
  assertLeasePeriod(renewalStartDate, renewalEndDate);

  try {
    return await db.transaction(async (rawTrx) => {
      const trx = rawTrx as unknown as Db;
      await lockRoomForLeaseWrite(existing.roomId, trx);
      await assertNoOverlap(existing.roomId, renewalStartDate, renewalEndDate, existing.id, trx);

      const endedLease = await endLeaseRow(
        existing.id,
        landlordId,
        toDateStr(existing.endDate)!,
        "Ended",
        trx,
      );
      if (!endedLease) throw new NotFoundError("Lease not found.");

      const renewed = await insertLease(
        {
          roomId: existing.roomId,
          tenantInfoId: existing.tenantInfoId,
          startDate: renewalStartDate,
          endDate: renewalEndDate,
          agreedRent: input.agreedRent ?? existing.agreedRent,
          deposit: input.deposit ?? existing.deposit,
          createdBy: landlordId,
        },
        trx,
      );

      await writeAudit(
        {
          actorUserId: landlordId,
          action: "lease.renewed",
          entityType: "leases",
          entityId: renewed.id,
          beforeValue: { previousLeaseId: existing.id, previousEndDate: toDateStr(existing.endDate) },
          afterValue: { startDate: renewalStartDate, endDate: renewalEndDate },
        },
        trx,
      );

      const detail = await findLeaseForLandlord(landlordId, renewed.id, trx);
      return serialize(detail!);
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError("This room already has an overlapping active lease.");
    }
    throw err;
  }
}

export async function updateOrRenewLeaseService(
  landlordId: string,
  leaseId: string,
  input: UpdateLeaseInput,
): Promise<LeaseView> {
  const existing = await findLeaseForLandlord(landlordId, leaseId);
  if (!existing) throw new NotFoundError("Lease not found.");

  if (input.renewalStartDate !== undefined) {
    return applyRenewal(landlordId, existing, input);
  }
  return applyPlainUpdate(landlordId, existing, input);
}

// US-LEASE-04 — ends a lease and (implicitly, via the derived-status query)
// releases the room once no other Active lease references it.
export async function endLeaseService(
  landlordId: string,
  leaseId: string,
  actualEndDate: string,
): Promise<LeaseView> {
  const existing = await findLeaseForLandlord(landlordId, leaseId);
  if (!existing) throw new NotFoundError("Lease not found.");
  if (existing.status !== "Active") {
    throw new UnprocessableError("Only an Active lease can be ended.", [
      { field: "status", message: "Lease is not Active." },
    ]);
  }
  if (actualEndDate < toDateStr(existing.startDate)!) {
    throw new UnprocessableError("actualEndDate cannot be before the lease's startDate.", [
      { field: "actualEndDate", message: "Must be on or after startDate." },
    ]);
  }

  return db.transaction(async (rawTrx) => {
    const trx = rawTrx as unknown as Db;
    const updated = await endLeaseRow(leaseId, landlordId, actualEndDate, "Ended", trx);
    if (!updated) throw new NotFoundError("Lease not found.");

    await writeAudit(
      {
        actorUserId: landlordId,
        action: "lease.ended",
        entityType: "leases",
        entityId: leaseId,
        beforeValue: { status: existing.status },
        afterValue: { status: "Ended", actualEndDate },
      },
      trx,
    );

    const detail = await findLeaseForLandlord(landlordId, leaseId, trx);
    return serialize(detail!);
  });
}

// US-LEASE-06 — also the function US-DASH-04 must call, so the two never
// diverge (architecture note in FEATURE-SPECS.md).
export async function listUpcomingExpirationsService(
  landlordId: string,
  windowDays: number = UPCOMING_EXPIRATION_WINDOW_DAYS,
): Promise<UpcomingExpirationView[]> {
  const today = businessDate();
  const until = addDays(today, windowDays);
  const rows = await findUpcomingExpirationsForLandlord(landlordId, today, until);
  return rows.map((row) => ({
    leaseId: row.id,
    propertyId: row.propertyId,
    propertyName: row.propertyName,
    roomId: row.roomId,
    roomName: row.roomName,
    tenantFullName: row.tenantFullName,
    endDate: toDateStr(row.endDate)!,
  }));
}

// US-LEASE-05 config endpoint.
export async function getLeaseReminderConfigService(
  landlordId: string,
  propertyId: string,
): Promise<LeaseReminderConfigView> {
  await assertPropertyOwnedByLandlord(propertyId, landlordId);
  const row = await findLeaseReminderConfig(propertyId);
  return serializeReminderConfig(propertyId, row);
}

export async function updateLeaseReminderConfigService(
  landlordId: string,
  propertyId: string,
  input: LeaseReminderConfigInput,
): Promise<LeaseReminderConfigView> {
  await assertPropertyOwnedByLandlord(propertyId, landlordId);
  const row = await upsertLeaseReminderConfig(propertyId, input);
  await writeAudit({
    actorUserId: landlordId,
    action: "leaseReminderConfig.updated",
    entityType: "lease_reminder_configs",
    entityId: propertyId,
    afterValue: input,
  });
  return serializeReminderConfig(propertyId, row);
}
