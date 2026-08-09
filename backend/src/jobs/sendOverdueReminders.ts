import { db } from "../db/index.js";
<<<<<<< HEAD
import { invoices, leases, tenantInfo, properties, rooms, leaseReminderConfigs, payments } from "../db/schema.js";
import { eq, and, lt, isNull } from "drizzle-orm";
=======
import { invoices, leases, tenantInfo, properties, rooms } from "../db/schema.js";
import { eq, and, lt } from "drizzle-orm";
>>>>>>> origin/main
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
<<<<<<< HEAD
      reminderEveryDays: leaseReminderConfigs.overdueReminderEveryDays,
=======
>>>>>>> origin/main
    })
    .from(invoices)
    .innerJoin(leases, eq(invoices.leaseId, leases.id))
    .innerJoin(tenantInfo, eq(leases.tenantInfoId, tenantInfo.id))
    .innerJoin(rooms, eq(invoices.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
<<<<<<< HEAD
    .leftJoin(leaseReminderConfigs, eq(properties.id, leaseReminderConfigs.propertyId))
    .leftJoin(payments, eq(invoices.id, payments.invoiceId))
    .where(
      and(
        eq(invoices.status, "Sent"),
        lt(invoices.dueDate, today),
        isNull(payments.id),
=======
    .where(
      and(
        eq(invoices.status, "Sent"),
        lt(invoices.dueDate, today) // wait, dueDate is string 'YYYY-MM-DD', comparing string works in PG
>>>>>>> origin/main
      )
    );

  for (const inv of overdueInvoices) {
    if (!inv.tenantUserId) continue; // No user account to send to
<<<<<<< HEAD
    const daysOverdue = Math.floor(
      (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${inv.dueDate}T00:00:00Z`)) /
        86_400_000,
    );
    const frequency = inv.reminderEveryDays ?? 1;
    if ((daysOverdue - 1) % frequency !== 0) continue;
=======
>>>>>>> origin/main

    const dedupeKey = `overdue:${inv.id}:${today}`;

    await sendNotification({
      userId: inv.tenantUserId,
      type: "payment.overdue",
      title: "Overdue Payment Reminder",
<<<<<<< HEAD
      body: `Invoice ${inv.id.slice(0, 8)} for ${inv.billingPeriod} was due ${inv.dueDate}. Outstanding: ${inv.totalAmount.toLocaleString("en-US")} VND.`,
=======
      body: `Your invoice for ${inv.billingPeriod} at ${inv.propertyName} is overdue. Please pay ${inv.totalAmount.toLocaleString("en-US")} VND.`,
>>>>>>> origin/main
      linkRef: `invoices/${inv.id}`,
      dedupeKey,
    }).catch(console.error); // Do not fail the whole job if one notification fails
  }
}
