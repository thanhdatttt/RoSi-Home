import { UnprocessableError } from "../../lib/errors.js";

// Effective date ranges are inclusive. A null end represents positive infinity.
export function rangesOverlap(
  firstStart: string,
  firstEnd: string | null,
  secondStart: string,
  secondEnd: string | null,
): boolean {
  const resolvedFirstEnd = firstEnd ?? "9999-12-31";
  const resolvedSecondEnd = secondEnd ?? "9999-12-31";
  return (
    firstStart <= resolvedSecondEnd && secondStart <= resolvedFirstEnd
  );
}

export function assertSurchargePeriod(
  effectiveFrom: string,
  effectiveTo: string | null,
): void {
  if (effectiveTo !== null && effectiveTo < effectiveFrom) {
    throw new UnprocessableError(
      "effectiveTo cannot be before effectiveFrom.",
      [{ field: "effectiveTo", message: "Must be on or after effectiveFrom." }],
    );
  }
}
