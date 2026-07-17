import { randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db, type Db } from "../../db/index.js";
import { tenantInfo, users } from "../../db/schema.js";
import { hashPassword } from "../../lib/auth.js";
import { sendEmail } from "../../lib/email.js";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { isUniqueViolation } from "../../lib/pgErrors.js";
import { type Paginated, type Pagination, paginate } from "../../lib/pagination.js";
import { writeAudit } from "../../db/audit.js";
import {
  type UpdateTenantInput,
} from "./schema.js";
import {
  countTenants,
  findTenantById,
  findUserByUsername,
  getTenantScoped,
  hasConflictingField,
  listTenants,
  type TenantRow,
} from "./repository.js";

export type TenantView = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
  createdByLandlordId: string;
  createdAt: string;
  updatedAt: string;
};

function serialize(row: TenantRow): TenantView {
  return {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    email: row.email,
    idNumber: row.idNumber,
    createdByLandlordId: row.createdByLandlordId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listTenantsService(
  landlordId: string,
  p: Pagination,
): Promise<Paginated<TenantView>> {
  const [rows, total] = await Promise.all([
    listTenants(landlordId, p),
    countTenants(landlordId),
  ]);
  return paginate(rows.map(serialize), total, p);
}

export async function getTenantService(
  landlordId: string,
  id: string,
): Promise<TenantView> {
  const row = await getTenantScoped(landlordId, id);
  if (!row) throw new NotFoundError("Tenant not found.");
  return serialize(row);
}

export async function updateTenantService(
  landlordId: string,
  id: string,
  input: UpdateTenantInput,
): Promise<TenantView> {
  const tenant = await getTenantScoped(landlordId, id);
  if (!tenant) throw new NotFoundError("Tenant not found.");

  if (input.phone !== undefined && (await hasConflictingField(id, "phone", input.phone))) {
    throw new ConflictError("Another tenant already uses this phone number.");
  }
  if (input.email !== undefined && (await hasConflictingField(id, "email", input.email))) {
    throw new ConflictError("Another tenant already uses this email.");
  }
  if (
    input.idNumber !== undefined &&
    (await hasConflictingField(id, "idNumber", input.idNumber))
  ) {
    throw new ConflictError("Another tenant already uses this ID number.");
  }

  // Tenant login username == phone. If the phone changes and the tenant has a
  // provisioned account, synchronize users.username and re-check uniqueness.
  let syncUsername: string | undefined;
  if (input.phone !== undefined && tenant.phone !== input.phone && tenant.userId) {
    const clash = await findUserByUsername(input.phone);
    if (clash && clash.id !== tenant.userId) {
      throw new ConflictError("This phone number is already used as a login username.");
    }
    syncUsername = input.phone;
  }

  try {
    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(tenantInfo)
        .set(input)
        .where(and(eq(tenantInfo.id, id), isNull(tenantInfo.deletedAt)))
        .returning();
      if (!row) throw new NotFoundError("Tenant not found.");
      if (syncUsername) {
        await tx
          .update(users)
          .set({ username: syncUsername })
          .where(eq(users.id, tenant.userId!));
      }
      return row;
    });
    await writeAudit({
      actorUserId: landlordId,
      action: "tenant.updated",
      entityType: "tenant_info",
      entityId: id,
      beforeValue: {
        fullName: tenant.fullName,
        phone: tenant.phone,
        email: tenant.email,
        idNumber: tenant.idNumber,
      },
      afterValue: input,
    });
    return serialize(updated);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError("This value conflicts with an existing tenant record.");
    }
    throw err;
  }
}

// US-TENANT-02 — invoked inside the POST /leases transaction (US-LEASE-01).
// `tx` lets the caller run this within their open transaction for atomicity.
export async function provisionTenantAccount(
  tenant: { id: string; fullName: string; phone: string; email: string },
  tx: Db = db,
): Promise<{ userId: string; provisioned: boolean }> {
  // Idempotency guard: a returning tenant already has an account; do not re-provision.
  const info = await findTenantById(tenant.id);
  if (!info) throw new NotFoundError("Tenant not found.");
  if (info.userId) {
    return { userId: info.userId, provisioned: false };
  }

  const tempPassword = randomBytes(9).toString("hex"); // >=8 chars, contains letters + digits
  const passwordHash = await hashPassword(tempPassword);

  const [user] = await tx
    .insert(users)
    .values({
      role: "Tenant",
      username: tenant.phone,
      passwordHash,
      mustChangePassword: true,
    })
    .returning();

  await tx
    .update(tenantInfo)
    .set({ userId: user.id })
    .where(eq(tenantInfo.id, tenant.id));

  await writeAudit({
    actorUserId: info.createdByLandlordId,
    action: "tenant.accountProvisioned",
    entityType: "tenant_info",
    entityId: tenant.id,
    afterValue: { userId: user.id },
  });

  // Credential delivery is best-effort and must not roll back the account/lease
  // on email-provider failure (US-TENANT-02 retry safety).
  await sendEmail(
    tenant.email,
    "Your RosiHome tenant account",
    `Welcome to RosiHome.\nUsername (phone): ${tenant.phone}\nTemporary password: ${tempPassword}\nPlease sign in and change your password.`,
  ).catch(() => undefined);

  return { userId: user.id, provisioned: true };
}
