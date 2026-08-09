import { and, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db, type Db } from "../../db/index.js";
import {
  invoiceLineItems,
  invoices,
  leases,
  maintenanceRequests,
  payments,
  properties,
  reports,
  rooms,
} from "../../db/schema.js";

// === Financial Metrics ===

export type RevenueBreakdown = {
  rent: number;
  electricity: number;
  water: number;
  surcharges: number;
};

export type FinancialMetrics = {
  expectedRevenue: RevenueBreakdown;
  actualCollectedRevenue: RevenueBreakdown;
};

export async function getRevenueSummary(
  landlordId: string,
  periodType: "month" | "custom",
  periodStart: Date,
  periodEnd: Date,
  monthStr?: string, // e.g. "2026-07"
  executor: Db = db
): Promise<FinancialMetrics> {
  const expected: RevenueBreakdown = { rent: 0, electricity: 0, water: 0, surcharges: 0 };
  const collected: RevenueBreakdown = { rent: 0, electricity: 0, water: 0, surcharges: 0 };

  // For expected revenue, the spec says: "billingPeriod within the selected period" 
  // or `billingPeriod = month`. If periodType is custom, we match invoices whose issueDate falls in period?
  // Wait, spec: "billingPeriod within the selected period for expected; payments.verifiedAt within the selected period for collected"
  // For custom period, string comparison on billingPeriod? Let's use issueDate between start and end for custom, 
  // or if month, billingPeriod = monthStr.
  const expectedCondition = periodType === "month" && monthStr 
    ? eq(invoices.billingPeriod, monthStr)
    : and(gte(invoices.issueDate, periodStart.toISOString().split("T")[0]), lte(invoices.issueDate, periodEnd.toISOString().split("T")[0]));

  const expectedRows = await executor
    .select({
      type: invoiceLineItems.type,
      amount: sql<number>`sum(${invoiceLineItems.amount})`,
    })
    .from(invoiceLineItems)
    .innerJoin(invoices, eq(invoiceLineItems.invoiceId, invoices.id))
    .innerJoin(leases, eq(invoices.leaseId, leases.id))
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        isNull(invoices.deletedAt),
        isNull(properties.deletedAt),
        eq(properties.landlordId, landlordId),
        expectedCondition
      )
    )
    .groupBy(invoiceLineItems.type);

  for (const row of expectedRows) {
    const amt = Number(row.amount);
    if (row.type === "Rent") expected.rent += amt;
    else if (row.type === "Electricity") expected.electricity += amt;
    else if (row.type === "Water") expected.water += amt;
    else expected.surcharges += amt;
  }

  // Actual Collected Revenue: payments.verifiedAt within the selected period
  const collectedRows = await executor
    .select({
      type: invoiceLineItems.type,
      amount: sql<number>`sum((${invoiceLineItems.amount}::decimal / ${invoices.totalAmount}::decimal) * ${payments.amount})`,
    })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .innerJoin(invoiceLineItems, eq(invoices.id, invoiceLineItems.invoiceId))
    .innerJoin(leases, eq(invoices.leaseId, leases.id))
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        isNull(invoices.deletedAt),
        isNull(properties.deletedAt),
        eq(properties.landlordId, landlordId),
        gte(payments.verifiedAt, periodStart),
        lte(payments.verifiedAt, periodEnd)
      )
    )
    .groupBy(invoiceLineItems.type);

  // Since payments might be partial, we approximated by pro-rating line items against the payment amount.
  // Wait, `amount` column in `payments` might be full amount. If it's full, prorating is fine.
  for (const row of collectedRows) {
    const amt = Number(row.amount);
    if (row.type === "Rent") collected.rent += amt;
    else if (row.type === "Electricity") collected.electricity += amt;
    else if (row.type === "Water") collected.water += amt;
    else collected.surcharges += amt;
  }

  // To avoid floating point issues
  collected.rent = Math.round(collected.rent);
  collected.electricity = Math.round(collected.electricity);
  collected.water = Math.round(collected.water);
  collected.surcharges = Math.round(collected.surcharges);

  return { expectedRevenue: expected, actualCollectedRevenue: collected };
}

// === Occupancy Metrics ===

export type OccupancyMetrics = {
  averageOccupancyRate: number | "N/A";
  moveIns: number;
  moveOuts: number;
};

export async function getOccupancyMetrics(
  landlordId: string,
  periodStart: Date,
  periodEnd: Date,
  executor: Db = db
): Promise<OccupancyMetrics> {
  const allRooms = await executor
    .select({
      id: rooms.id,
      createdAt: rooms.createdAt,
    })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        isNull(rooms.deletedAt),
        isNull(properties.deletedAt),
        eq(properties.landlordId, landlordId)
      )
    );

  const allLeases = await executor
    .select({
      id: leases.id,
      roomId: leases.roomId,
      startDate: leases.startDate,
      actualEndDate: leases.actualEndDate,
      endDate: leases.endDate,
      status: leases.status,
    })
    .from(leases)
    .innerJoin(rooms, eq(leases.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        isNull(leases.deletedAt),
        isNull(rooms.deletedAt),
        isNull(properties.deletedAt),
        eq(properties.landlordId, landlordId)
      )
    );

  const periodLength = Math.max(1, Math.floor((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  let availableActiveRoomDays = 0;
  let occupiedRoomDays = 0;

  let moveIns = 0;
  let moveOuts = 0;

  for (const r of allRooms) {
    // Room is active for the whole period if created before start, else only from creation to end.
    const roomStart = r.createdAt.getTime() > periodStart.getTime() ? r.createdAt : periodStart;
    const daysActive = Math.max(0, Math.floor((periodEnd.getTime() - roomStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    availableActiveRoomDays += daysActive;
  }

  for (const l of allLeases) {
    const lStart = new Date(l.startDate);
    const lEnd = l.actualEndDate ? new Date(l.actualEndDate) : (l.status === "Ended" ? new Date(l.endDate) : new Date(2100, 0, 1));
    
    // Check if lStart falls in period
    if (lStart >= periodStart && lStart <= periodEnd) {
      moveIns++;
    }

    // Check if moveOut falls in period
    if (l.actualEndDate && new Date(l.actualEndDate) >= periodStart && new Date(l.actualEndDate) <= periodEnd) {
      moveOuts++;
    }

    // Days occupied in period
    const startOcc = lStart > periodStart ? lStart : periodStart;
    const endOcc = lEnd < periodEnd ? lEnd : periodEnd;
    
    if (startOcc <= endOcc && (l.status === "Active" || l.status === "Ended")) {
      const days = Math.floor((endOcc.getTime() - startOcc.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      occupiedRoomDays += days;
    }
  }

  let averageOccupancyRate: number | "N/A" = "N/A";
  if (availableActiveRoomDays > 0) {
    averageOccupancyRate = Math.round((occupiedRoomDays / availableActiveRoomDays) * 100);
  }

  return { averageOccupancyRate, moveIns, moveOuts };
}

// === Maintenance Metrics ===

export type MaintenanceMetrics = {
  newRequests: number;
  completedRequests: number;
  resolutionRate: number | "N/A";
  averageResolutionTime: number | "N/A"; // hours
};

export async function getMaintenanceMetrics(
  landlordId: string,
  periodStart: Date,
  periodEnd: Date,
  executor: Db = db
): Promise<MaintenanceMetrics> {
  const reqs = await executor
    .select({
      id: maintenanceRequests.id,
      submittedAt: maintenanceRequests.submittedAt,
      completedAt: maintenanceRequests.completedAt,
    })
    .from(maintenanceRequests)
    .innerJoin(rooms, eq(maintenanceRequests.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        isNull(maintenanceRequests.deletedAt),
        isNull(properties.deletedAt),
        eq(properties.landlordId, landlordId)
      )
    );

  let newRequests = 0;
  let completedRequests = 0;
  let totalResolutionMs = 0;

  for (const r of reqs) {
    const submitted = r.submittedAt;
    const completed = r.completedAt;

    if (submitted >= periodStart && submitted <= periodEnd) {
      newRequests++;
    }

    if (completed && completed >= periodStart && completed <= periodEnd) {
      completedRequests++;
      totalResolutionMs += (completed.getTime() - submitted.getTime());
    }
  }

  let resolutionRate: number | "N/A" = "N/A";
  let averageResolutionTime: number | "N/A" = "N/A";

  if (newRequests > 0) {
    resolutionRate = Math.round((completedRequests / newRequests) * 100);
  } else if (newRequests === 0 && completedRequests > 0) {
     resolutionRate = 100; // Special case: resolved requests but 0 new ones
  }

  if (completedRequests > 0) {
    averageResolutionTime = Math.round((totalResolutionMs / completedRequests) / (1000 * 60 * 60)); // Hours
  }

  return { newRequests, completedRequests, resolutionRate, averageResolutionTime };
}

// === Persist Report ===

export async function saveReport(
  landlordId: string,
  periodType: string,
  periodStart: Date,
  periodEnd: Date,
  snapshot: any,
  executor: Db = db
) {
  const [row] = await executor.insert(reports).values({
    landlordId,
    periodType,
    periodStart: periodStart.toISOString().split("T")[0],
    periodEnd: periodEnd.toISOString().split("T")[0],
    snapshot: JSON.stringify(snapshot),
  }).returning();
  
  return row.id;
}

<<<<<<< HEAD
export async function getReportById(
  reportId: string,
  landlordId: string,
  executor: Db = db,
): Promise<(typeof reports.$inferSelect) | undefined> {
=======
export async function getReportById(reportId: string, landlordId: string, executor: Db = db) {
>>>>>>> origin/main
  const [row] = await executor.select()
    .from(reports)
    .where(and(eq(reports.id, reportId), eq(reports.landlordId, landlordId)));
  return row;
}
