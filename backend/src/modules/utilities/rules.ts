import { UnprocessableError } from "../../lib/errors.js";
import type { UtilityRateInput } from "./schema.js";

export type FieldIssue = { field: string; message: string };

export function getWaterFieldIssues(input: UtilityRateInput): FieldIssue[] {
  const hasMeteredRate =
    input.waterRatePerM3 !== undefined && input.waterRatePerM3 !== null;
  const hasFlatAmount =
    input.waterFlatAmountPerTenant !== undefined &&
    input.waterFlatAmountPerTenant !== null;
  const fields: FieldIssue[] = [];

  if (input.waterBillingMethod === "Metered") {
    if (!hasMeteredRate) {
      fields.push({
        field: "waterRatePerM3",
        message: "waterRatePerM3 is required when method is Metered.",
      });
    }
    if (hasFlatAmount) {
      fields.push({
        field: "waterFlatAmountPerTenant",
        message: "waterFlatAmountPerTenant must be omitted for Metered.",
      });
    }
  } else {
    if (!hasFlatAmount) {
      fields.push({
        field: "waterFlatAmountPerTenant",
        message: "waterFlatAmountPerTenant is required when method is Flat.",
      });
    }
    if (hasMeteredRate) {
      fields.push({
        field: "waterRatePerM3",
        message: "waterRatePerM3 must be omitted for Flat.",
      });
    }
  }

  return fields;
}

export function assertWaterFields(input: UtilityRateInput): void {
  const fields = getWaterFieldIssues(input);
  if (fields.length > 0) {
    throw new UnprocessableError(
      "The water billing fields do not match the selected billing method.",
      fields,
    );
  }
}
