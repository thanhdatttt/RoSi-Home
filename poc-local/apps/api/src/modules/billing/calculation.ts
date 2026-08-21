import { createHash } from "node:crypto";
import type {
  InvoiceInputSnapshot,
  InvoiceLineItem,
} from "../../db/schema.js";
import { HttpError } from "../../lib/errors.js";
import type { GenerateInvoiceInput } from "./schema.js";

const SCALE = 1_000n;
const HALF_SCALE = 500n;
const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);
const MAX_VIETQR_AMOUNT = 9_999_999_999_999n;

export function decimalToMilli(value: string): bigint {
  const [whole = "0", fraction = ""] = value.split(".");
  return BigInt(whole) * SCALE + BigInt(fraction.padEnd(3, "0"));
}

export function formatMilli(value: bigint): string {
  const whole = value / SCALE;
  const fraction = (value % SCALE).toString().padStart(3, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

function toSafeNumber(value: bigint, field: string): number {
  if (value > MAX_SAFE) {
    throw new HttpError(
      422,
      "AMOUNT_TOO_LARGE",
      `${field} exceeds the safe integer range for this PoC`,
    );
  }
  return Number(value);
}

export function calculateRoundedCharge(
  consumptionMilli: bigint,
  rate: number,
): number {
  const rounded = (consumptionMilli * BigInt(rate) + HALF_SCALE) / SCALE;
  return toSafeNumber(rounded, "Utility charge");
}

export interface BillingCalculation {
  electricityCharge: number;
  inputFingerprint: string;
  inputSnapshot: InvoiceInputSnapshot;
  lineItems: InvoiceLineItem[];
  total: number;
  waterCharge: number;
}

export function calculateInvoice(
  input: GenerateInvoiceInput,
  rates: { electricityRate: number; waterRate: number },
): BillingCalculation {
  const previousElectricity = decimalToMilli(input.previousElectricity);
  const currentElectricity = decimalToMilli(input.currentElectricity);
  const previousWater = decimalToMilli(input.previousWater);
  const currentWater = decimalToMilli(input.currentWater);
  const electricityConsumption = currentElectricity - previousElectricity;
  const waterConsumption = currentWater - previousWater;
  const electricityCharge = calculateRoundedCharge(
    electricityConsumption,
    rates.electricityRate,
  );
  const waterCharge = calculateRoundedCharge(waterConsumption, rates.waterRate);
  const totalValue =
    BigInt(input.baseRent) + BigInt(electricityCharge) + BigInt(waterCharge);
  if (totalValue > MAX_VIETQR_AMOUNT) {
    throw new HttpError(
      422,
      "INVOICE_AMOUNT_TOO_LARGE",
      "Invoice total exceeds the 13-digit VietQR amount limit",
    );
  }
  const total = toSafeNumber(totalValue, "Invoice total");

  const inputSnapshot: InvoiceInputSnapshot = {
    baseRent: input.baseRent,
    billingPeriod: input.billingPeriod,
    calculationPolicy: "MILLI_UNIT_HALF_UP_V1",
    currentElectricity: formatMilli(currentElectricity),
    currentWater: formatMilli(currentWater),
    dueDate: input.dueDate,
    electricityRate: rates.electricityRate,
    issueDate: input.issueDate,
    previousElectricity: formatMilli(previousElectricity),
    previousWater: formatMilli(previousWater),
    roomReference: input.roomReference,
    tenantName: input.tenantName,
    waterRate: rates.waterRate,
  };

  const lineItems: InvoiceLineItem[] = [
    {
      amount: input.baseRent,
      code: "BASE_RENT",
      description: "Base rent",
    },
    {
      amount: electricityCharge,
      code: "ELECTRICITY",
      description: "Electricity",
      quantity: formatMilli(electricityConsumption),
      rate: rates.electricityRate,
    },
    {
      amount: waterCharge,
      code: "WATER",
      description: "Water",
      quantity: formatMilli(waterConsumption),
      rate: rates.waterRate,
    },
  ];

  const inputFingerprint = createHash("sha256")
    .update(JSON.stringify(inputSnapshot))
    .digest("hex");

  return {
    electricityCharge,
    inputFingerprint,
    inputSnapshot,
    lineItems,
    total,
    waterCharge,
  };
}
