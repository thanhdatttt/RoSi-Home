import { db } from "../db/index.js";
import { invoices, leases, tenantInfo, properties, rooms } from "../db/schema.js";
import { eq, and, lt } from "drizzle-orm";
import { sendNotification } from "../modules/notifications/service.js";

export async function sendOverdueReminders(): Promise<void> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const overdueInvoices = await db
    .select({
      id: invoices.id,
      totalAmount: invoices.totalAmount,
      billingPeriod: invoices.billingPeriod,
      dueDate: invoices.dueDate,
      tenantUserId: tenantInfo.userId,
      propertyName: properties.name,
    })
    .from(invoices)
    .innerJoin(leases, eq(invoices.leaseId, leases.id))
    .innerJoin(tenantInfo, eq(leases.tenantInfoId, tenantInfo.id))
    .innerJoin(rooms, eq(invoices.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        eq(invoices.status, "Sent"),
        lt(invoices.dueDate, today) // wait, dueDate is string 'YYYY-MM-DD', comparing string works in PG
      )
    );

  for (const inv of overdueInvoices) {
    if (!inv.tenantUserId) continue; // No user account to send to

    const dedupeKey = `overdue:${inv.id}:${today}`;

    await sendNotification({
      userId: inv.tenantUserId,
      type: "payment.overdue",
      title: "Overdue Payment Reminder",
      body: `Your invoice for ${inv.billingPeriod} at ${inv.propertyName} is overdue. Please pay ${inv.totalAmount.toLocaleString("en-US")} VND.`,
      linkRef: `invoices/${inv.id}`,
      dedupeKey,
    }).catch(console.error); // Do not fail the whole job if one notification fails
  }
}
