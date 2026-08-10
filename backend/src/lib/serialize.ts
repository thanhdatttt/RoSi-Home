// Converts a date-ish value to a YYYY-MM-DD string. Strings pass through
// (already in date form); null/undefined become null. Shared by the module
// serializers so the formatting rule lives in one place.
export function toDateStr(d: Date | string | null | undefined): string | null {
  if (d === null || d === undefined) return null;
  if (typeof d === "string") return d;
  return d.toISOString().slice(0, 10);
}
