import { and, desc, eq } from "drizzle-orm";
import type { AppDrizzle } from "../../db/client.js";
import {
  bankAccounts,
  invoices,
  properties,
  utilityRates,
} from "../../db/schema.js";
import type { BankAccountInput } from "./schema.js";

export type InvoiceRecord = typeof invoices.$inferSelect;
export type NewInvoiceRecord = typeof invoices.$inferInsert;

export class BillingRepository {
  constructor(private readonly db: AppDrizzle) {}

  async findOwnedPropertyContext(propertyId: string, landlordId: string) {
    const rows = await this.db
      .select({
        electricityRate: utilityRates.electricityRate,
        propertyId: properties.id,
        propertyName: properties.name,
        waterRate: utilityRates.waterRate,
      })
      .from(properties)
      .leftJoin(utilityRates, eq(utilityRates.propertyId, properties.id))
      .where(and(eq(properties.id, propertyId), eq(properties.landlordId, landlordId)))
      .limit(1);
    return rows[0] ?? null;
  }

  async insertInvoice(invoice: NewInvoiceRecord): Promise<InvoiceRecord | null> {
    const rows = await this.db
      .insert(invoices)
      .values(invoice)
      .onConflictDoNothing({
        target: [invoices.propertyId, invoices.roomReference, invoices.billingPeriod],
      })
      .returning();
    return rows[0] ?? null;
  }

  async findByIdentity(
    propertyId: string,
    roomReference: string,
    billingPeriod: string,
  ): Promise<InvoiceRecord | null> {
    const rows = await this.db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.propertyId, propertyId),
          eq(invoices.roomReference, roomReference),
          eq(invoices.billingPeriod, billingPeriod),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  }

  async findOwnedInvoice(id: string, landlordId: string): Promise<InvoiceRecord | null> {
    const rows = await this.db
      .select({ invoice: invoices })
      .from(invoices)
      .innerJoin(properties, eq(properties.id, invoices.propertyId))
      .where(and(eq(invoices.id, id), eq(properties.landlordId, landlordId)))
      .limit(1);
    return rows[0]?.invoice ?? null;
  }

  async listOwnedInvoices(
    landlordId: string,
    propertyId?: string,
  ): Promise<InvoiceRecord[]> {
    const ownership = eq(properties.landlordId, landlordId);
    const rows = await this.db
      .select({ invoice: invoices })
      .from(invoices)
      .innerJoin(properties, eq(properties.id, invoices.propertyId))
      .where(propertyId ? and(ownership, eq(properties.id, propertyId)) : ownership)
      .orderBy(desc(invoices.createdAt));
    return rows.map((row) => row.invoice);
  }

  async markSent(id: string, sentAt: string): Promise<InvoiceRecord | null> {
    const rows = await this.db
      .update(invoices)
      .set({ sentAt, status: "Sent" })
      .where(and(eq(invoices.id, id), eq(invoices.status, "Draft")))
      .returning();
    return rows[0] ?? null;
  }

  async getBankAccount(landlordId: string) {
    const rows = await this.db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.landlordId, landlordId))
      .limit(1);
    return rows[0] ?? null;
  }

  async saveBankAccount(landlordId: string, input: BankAccountInput) {
    const rows = await this.db
      .insert(bankAccounts)
      .values({ landlordId, ...input })
      .onConflictDoUpdate({
        target: bankAccounts.landlordId,
        set: { ...input, updatedAt: new Date().toISOString() },
      })
      .returning();
    return rows[0];
  }
}
