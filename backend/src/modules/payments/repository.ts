import { eq, inArray, sql, desc, and, ne } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  landlordPaymentConfigs,
  payments,
  paymentProofs,
  invoices,
  properties,
  rooms,
  leases,
} from "../../db/schema.js";
import { NotFoundError, UnprocessableError, ForbiddenError } from "../../lib/errors.js";

<<<<<<< HEAD
type PaymentConfigRow = typeof landlordPaymentConfigs.$inferSelect;

export const PaymentRepository = {
  async getPaymentConfig(landlordId: string): Promise<PaymentConfigRow | null> {
=======
export const PaymentRepository = {
  async getPaymentConfig(landlordId: string) {
>>>>>>> origin/main
    const config = await db
      .select()
      .from(landlordPaymentConfigs)
      .where(eq(landlordPaymentConfigs.landlordId, landlordId))
      .limit(1);
    return config[0] || null;
  },

  async upsertPaymentConfig(
    landlordId: string,
    data: { bankCode: string; accountNumber: string; accountHolderName: string }
  ) {
    const existing = await this.getPaymentConfig(landlordId);
    if (existing) {
      const [updated] = await db
        .update(landlordPaymentConfigs)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(landlordPaymentConfigs.landlordId, landlordId))
        .returning();
      return updated;
    } else {
      const [inserted] = await db
        .insert(landlordPaymentConfigs)
        .values({
          landlordId,
          ...data,
        })
        .returning();
      return inserted;
    }
  },

  async getPendingProofsForLandlord(landlordId: string) {
    const proofs = await db
      .select({
        id: paymentProofs.id,
        invoiceId: paymentProofs.invoiceId,
        tenantInfoId: paymentProofs.tenantInfoId,
        fileUrl: paymentProofs.fileUrl,
        status: paymentProofs.status,
        uploadedAt: paymentProofs.uploadedAt,
        invoice: {
          totalAmount: invoices.totalAmount,
          billingPeriod: invoices.billingPeriod,
          status: invoices.status,
        },
        room: {
          name: rooms.name,
        },
        property: {
          name: properties.name,
        },
      })
      .from(paymentProofs)
      .innerJoin(invoices, eq(paymentProofs.invoiceId, invoices.id))
      .innerJoin(rooms, eq(invoices.roomId, rooms.id))
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(
        and(
          eq(properties.landlordId, landlordId),
          eq(paymentProofs.status, "Pending")
        )
      )
      .orderBy(desc(paymentProofs.uploadedAt));
    return proofs;
  },

  async createPayment(
    invoiceId: string,
    amount: number,
    verifiedBy: string,
    proofId?: string
  ) {
    return db.transaction(async (tx) => {
      // Create payment record
      const [payment] = await tx
        .insert(payments)
        .values({
          invoiceId,
          amount,
          verifiedBy,
          proofId,
        })
<<<<<<< HEAD
        .onConflictDoNothing({ target: payments.invoiceId })
        .returning();

      if (!payment) {
        const [existing] = await tx
          .select()
          .from(payments)
          .where(eq(payments.invoiceId, invoiceId))
          .limit(1);
        if (!existing) {
          throw new UnprocessableError("Payment confirmation could not be completed");
        }
        return { payment: existing, created: false as const };
      }

=======
        .returning();

>>>>>>> origin/main
      // Update invoice status
      await tx
        .update(invoices)
        .set({ status: "Paid" })
        .where(eq(invoices.id, invoiceId));

      // Mark payment proof as verified
      if (proofId) {
        await tx
          .update(paymentProofs)
          .set({ status: "Verified" })
          .where(eq(paymentProofs.id, proofId));
      } else {
        // Find any pending proofs for this invoice and mark verified since the landlord verified it
        await tx
          .update(paymentProofs)
          .set({ status: "Verified" })
          .where(and(eq(paymentProofs.invoiceId, invoiceId), eq(paymentProofs.status, "Pending")));
      }

<<<<<<< HEAD
      return { payment, created: true as const };
=======
      return payment;
>>>>>>> origin/main
    });
  },

  async getExistingPayment(invoiceId: string) {
    const [existing] = await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .limit(1);
    return existing || null;
  },

  async getPaymentHistoryForLandlord(landlordId: string) {
    // Get all invoices for properties owned by the landlord
    const history = await db
      .select({
        invoiceId: invoices.id,
        amount: invoices.totalAmount,
        billingPeriod: invoices.billingPeriod,
        status: invoices.status,
        verifiedAt: payments.verifiedAt,
      })
      .from(invoices)
      .innerJoin(rooms, eq(invoices.roomId, rooms.id))
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .leftJoin(payments, eq(invoices.id, payments.invoiceId))
      .where(
        and(
          eq(properties.landlordId, landlordId),
          // typically exclude draft or soft deleted, history usually shows Sent and Paid
          ne(invoices.status, "Draft"),
          sql`${invoices.deletedAt} IS NULL`
        )
      )
      .orderBy(desc(invoices.issueDate));
      
    // Calculate outstanding total (only Sent invoices)
    const outstandingTotal = history
      .filter((i) => i.status === "Sent")
      .reduce((sum, i) => sum + i.amount, 0);

    return { entries: history, outstandingTotal };
  },

  async getPaymentHistoryForTenant(tenantInfoId: string) {
    // Get all invoices for the tenant
    const history = await db
      .select({
        invoiceId: invoices.id,
        amount: invoices.totalAmount,
        billingPeriod: invoices.billingPeriod,
        status: invoices.status,
        verifiedAt: payments.verifiedAt,
      })
      .from(invoices)
      .innerJoin(leases, eq(invoices.leaseId, leases.id))
      .leftJoin(payments, eq(invoices.id, payments.invoiceId))
      .where(
        and(
          eq(leases.tenantInfoId, tenantInfoId),
          ne(invoices.status, "Draft"),
          sql`${invoices.deletedAt} IS NULL`
        )
      )
      .orderBy(desc(invoices.issueDate));

    // Calculate outstanding total
    const outstandingTotal = history
      .filter((i) => i.status === "Sent")
      .reduce((sum, i) => sum + i.amount, 0);

    return { entries: history, outstandingTotal };
  },
};
