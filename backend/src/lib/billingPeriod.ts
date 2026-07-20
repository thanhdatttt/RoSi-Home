import { config } from "./config.js";

// Billing periods are `YYYY-MM` strings (e.g. "2026-06"). Monthly billing only.
export const BILLING_PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidBillingPeriod(period: string): boolean {
  return BILLING_PERIOD_REGEX.test(period);
}

export type PeriodBounds = { start: string; end: string };

// Inclusive [first day, last day] of the billing month as `YYYY-MM-DD`.
export function periodBounds(period: string): PeriodBounds {
  const [year, month] = period.split("-").map(Number);
  const start = `${period}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const end = `${period}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

// Previous calendar month relative to `now`, formatted `YYYY-MM`.
export function previousMonthPeriod(now: Date = new Date()): string {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-indexed; 0 means January.
  if (month === 0) return `${year - 1}-12`;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export type InvoiceDates = { issueDate: string; dueDate: string };

// Issue/due dates live within the billing month at the configured day-of-month.
export function deriveInvoiceDates(period: string): InvoiceDates {
  const issueDay = config.invoiceIssueDay;
  const dueDay = config.invoiceDueDay;
  return {
    issueDate: withDay(period, issueDay),
    dueDate: withDay(period, dueDay),
  };
}

function withDay(period: string, day: number): string {
  const [year, month] = period.split("-").map(Number) as [number, number];
  // Date.UTC expects a 0-indexed month.
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toISOString().slice(0, 10);
}
