import { UnprocessableError } from "../../lib/errors.js";

export function assertLeasePeriod(startDate: string, endDate: string): void {
  if (endDate <= startDate) {
    throw new UnprocessableError("endDate must be after startDate.", [
      { field: "endDate", message: "Must be after startDate." },
    ]);
  }
}

// Lease periods are inclusive on both ends: two leases with
// [2026-01-01, 2026-06-30] and [2026-06-30, 2026-12-31] do overlap.
export function rangesOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
): boolean {
  return firstStart <= secondEnd && secondStart <= firstEnd;
}

export const UPCOMING_EXPIRATION_WINDOW_DAYS = 30;

export const LEASE_REMINDER_OFFSETS = [30, 15, 7] as const;
export type LeaseReminderOffset = (typeof LEASE_REMINDER_OFFSETS)[number];

// YYYY-MM-DD arithmetic without pulling in a date library — every date in
// this module is a plain calendar date (no time-of-day/timezone component),
// so constructing at UTC noon and reading back the UTC date fields is safe.
export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
