import { z } from "zod";

const decimalReading = z
  .string()
  .trim()
  .regex(/^\d{1,9}(?:\.\d{1,3})?$/, "Use a non-negative decimal with at most 3 fractional digits");

const isoDate = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, "Use a valid date in YYYY-MM-DD format");

export const bankAccountInputSchema = z.object({
  bankBin: z.string().trim().regex(/^\d{6}$/, "Bank BIN must contain exactly 6 digits"),
  accountNumber: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{5,19}$/, "Account number must be 5-19 alphanumeric characters")
    .transform((value) => value.toUpperCase()),
  accountName: z.string().trim().min(2).max(100),
});

export const generateInvoiceInputSchema = z
  .object({
    propertyId: z.string().uuid(),
    roomReference: z
      .string()
      .trim()
      .min(1)
      .max(8)
      .regex(/^[A-Za-z0-9.]+$/, "Room reference may contain letters, digits, and period")
      .transform((value) => value.toUpperCase()),
    tenantName: z.string().trim().min(2).max(100),
    billingPeriod: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM"),
    issueDate: isoDate,
    dueDate: isoDate,
    baseRent: z.number().int().min(0).max(1_000_000_000_000),
    previousElectricity: decimalReading,
    currentElectricity: decimalReading,
    previousWater: decimalReading,
    currentWater: decimalReading,
  })
  .superRefine((input, context) => {
    if (input.dueDate < input.issueDate) {
      context.addIssue({
        code: "custom",
        message: "Due date cannot be before issue date",
        path: ["dueDate"],
      });
    }
    if (Number(input.currentElectricity) < Number(input.previousElectricity)) {
      context.addIssue({
        code: "custom",
        message: "Current electricity reading cannot be lower than previous reading",
        path: ["currentElectricity"],
      });
    }
    if (Number(input.currentWater) < Number(input.previousWater)) {
      context.addIssue({
        code: "custom",
        message: "Current water reading cannot be lower than previous reading",
        path: ["currentWater"],
      });
    }
  });

export const invoiceListQuerySchema = z.object({
  propertyId: z.string().uuid().optional(),
});

export const invoiceIdSchema = z.string().uuid();

export type BankAccountInput = z.infer<typeof bankAccountInputSchema>;
export type GenerateInvoiceInput = z.infer<typeof generateInvoiceInputSchema>;
