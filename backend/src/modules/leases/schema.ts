import { z } from "zod";

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.")
  .refine(
    (value) => {
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
      );
    },
    { message: "Date must be a valid calendar date." },
  );

const money = z.number().int("Amount must be a whole-number VND amount.").min(0, "Amount cannot be negative.");

const tenantInputSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required."),
    phone: z
      .string()
      .trim()
      .min(1, "Phone is required.")
      .regex(/^[0-9+()\-\s]+$/, "Phone contains invalid characters."),
    idNumber: z.string().trim().min(1, "ID number is required."),
    email: z.string().trim().email("Invalid email."),
  })
  .strict();

export const createLeaseSchema = z
  .object({
    roomId: z.string().uuid("roomId must be a valid id."),
    tenant: tenantInputSchema,
    startDate: dateStr,
    endDate: dateStr,
    agreedRent: money,
    deposit: money,
  })
  .strict();

// PATCH /leases/:id accepts either a plain edit (endDate/agreedRent/deposit)
// or a renewal (renewalStartDate + renewalEndDate, optionally with updated
// agreedRent/deposit) — never both in the same request (US-LEASE-03).
export const updateLeaseSchema = z
  .object({
    endDate: dateStr.optional(),
    agreedRent: money.optional(),
    deposit: money.optional(),
    renewalStartDate: dateStr.optional(),
    renewalEndDate: dateStr.optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field must be provided.",
  })
  .refine((v) => (v.renewalStartDate === undefined) === (v.renewalEndDate === undefined), {
    message: "renewalStartDate and renewalEndDate must be provided together.",
    path: ["renewalEndDate"],
  })
  .refine((v) => !(v.renewalStartDate !== undefined && v.endDate !== undefined), {
    message: "Provide either endDate or a renewal period, not both.",
    path: ["endDate"],
  });

export const endLeaseSchema = z
  .object({
    actualEndDate: dateStr,
  })
  .strict();

export const leaseReminderConfigSchema = z
  .object({
    remindAt30Days: z.boolean().optional(),
    remindAt15Days: z.boolean().optional(),
    remindAt7Days: z.boolean().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field must be provided.",
  });

export const leaseListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    propertyId: z.string().uuid().optional(),
  })
  .strict();

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>;
export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>;
export type EndLeaseInput = z.infer<typeof endLeaseSchema>;
export type LeaseReminderConfigInput = z.infer<typeof leaseReminderConfigSchema>;
export type LeaseListQuery = z.infer<typeof leaseListQuerySchema>;
