import { ConflictError, NotFoundError, UnprocessableError } from "../../lib/errors.js";
import { writeAudit } from "../../db/audit.js";
import { db } from "../../db/index.js";
import { roundVnd } from "../../lib/money.js";
import { periodBounds } from "../../lib/billingPeriod.js";
import {
  resolveElectricityRate,
  resolveWaterRate,
} from "../utilities/rateResolver.js";
import {
  assertRoomOwned,
  createMeterReading,
  findActiveReading,
  findPreviousReading,
  findMeterReadingById,
  supersedeReading,
  type MeterReadingRow,
} from "./repository.js";
import type { MeterReadingInput } from "./schema.js";
import {
  findActiveInvoiceForRoomPeriod,
  type InvoiceRow,
} from "../invoices/repository.js";
import { recalculateDraftInvoice } from "../invoices/service.js";

export type MeterReadingView = {
  id: string;
  roomId: string;
  utilityType: "Electricity" | "Water";
  billingPeriod: string;
  value: number;
  isInitial: boolean;
  previousValue: number | null;
  consumption: number | null;
  unitRate: number | null;
  amount: number;
  rateSource: string | null;
  rateSourceId: string | null;
  rateSourceReference: string | null;
  rateEffectiveFrom: string | null;
  locality: string | null;
  tenantCount: number | null;
  recordedBy: string;
  createdAt: string;
};

function serialize(row: MeterReadingRow): MeterReadingView {
  return {
    id: row.id,
    roomId: row.roomId,
    utilityType: row.utilityType,
    billingPeriod: row.billingPeriod,
    value: Number(row.value),
    isInitial: row.isInitial,
    previousValue: row.previousValue === null ? null : Number(row.previousValue),
    consumption: row.consumption === null ? null : Number(row.consumption),
    unitRate: row.unitRate,
    amount: row.amount,
    rateSource: row.rateSource,
    rateSourceId: row.rateSourceId,
    rateSourceReference: row.rateSourceReference,
    rateEffectiveFrom:
      row.rateEffectiveFrom === null ? null : String(row.rateEffectiveFrom),
    locality: row.locality,
    tenantCount: row.tenantCount,
    recordedBy: row.recordedBy,
    createdAt: row.createdAt.toISOString(),
  };
}

function toScale4(n: number): string {
  return n.toFixed(4);
}

// US-METER-01 / US-METER-02 — record an initial baseline or a monthly reading
// and persist the reproducible calculation result.
export async function recordMeterReadingService(
  landlordId: string,
  roomId: string,
  input: MeterReadingInput,
): Promise<MeterReadingView> {
  const { propertyId, locality } = await assertRoomOwned(roomId, landlordId);

  const existing = await findActiveReading(
    roomId,
    input.utilityType,
    input.billingPeriod,
  );
  if (existing) {
    throw new ConflictError(
      "A reading for this room, utility, and billing period already exists.",
    );
  }

  const { end: periodEnd } = periodBounds(input.billingPeriod);

  // Flat water is billed by flat amount, not metered; no reading is expected.
  if (input.utilityType === "Water") {
    const water = await resolveWaterRate(propertyId, locality, periodEnd);
    if (water.method === "Flat") {
      throw new UnprocessableError(
        "This property bills water by a flat amount; meter readings are not required.",
        [{ field: "utilityType", message: "Water is billed flat; no reading expected." }],
      );
    }
  }

  let previousValue: string | null = null;
  let consumption: string | null = null;
  let unitRate: number | null = null;
  let amount = 0;
  let rateSource: string | null = null;
  let rateSourceId: string | null = null;
  let rateSourceReference: string | null = null;
  let rateEffectiveFrom: string | null = null;

  if (input.isInitial) {
    // Baseline reading creates no consumption or charge.
    amount = 0;
  } else {
    const prev = await findPreviousReading(
      roomId,
      input.utilityType,
      input.billingPeriod,
    );
    if (!prev) {
      throw new UnprocessableError(
        "No preceding reading found. Record the initial (baseline) reading for this room and utility first.",
        [{ field: "billingPeriod", message: "A preceding reading is required." }],
      );
    }
    const prevVal = Number(prev.value);
    if (input.value < prevVal) {
      throw new UnprocessableError(
        "Current reading cannot be lower than the previous reading.",
        [
          {
            field: "value",
            message: "Must be greater than or equal to the previous reading.",
          },
        ],
      );
    }

    const cons = input.value - prevVal;
    previousValue = prev.value;

    if (input.utilityType === "Electricity") {
      const rate = await resolveElectricityRate(propertyId, locality, periodEnd);
      unitRate = rate.ratePerKwh!;
      rateSource = rate.source;
      rateSourceId = rate.sourceId;
      rateSourceReference = rate.sourceReference;
      rateEffectiveFrom = rate.effectiveFrom;
    } else {
      const rate = await resolveWaterRate(propertyId, locality, periodEnd);
      unitRate = rate.ratePerM3!;
      rateSource = rate.source;
      rateSourceId = rate.sourceId;
      rateSourceReference = rate.sourceReference;
      rateEffectiveFrom = rate.effectiveFrom;
    }

    consumption = toScale4(cons);
    amount = roundVnd(cons * unitRate);
  }

  const row = await createMeterReading({
    roomId,
    utilityType: input.utilityType,
    billingPeriod: input.billingPeriod,
    value: toScale4(input.value),
    isInitial: input.isInitial,
    previousValue,
    consumption,
    unitRate,
    amount,
    rateSource,
    rateSourceId: rateSource === null ? null : rateSourceId ?? null,
    rateSourceReference,
    rateEffectiveFrom,
    locality,
    tenantCount: null,
    recordedBy: landlordId,
  });

  await writeAudit({
    actorUserId: landlordId,
    action: "meter_reading.created",
    entityType: "meter_readings",
    entityId: row.id,
    afterValue: {
      roomId,
      utilityType: input.utilityType,
      billingPeriod: input.billingPeriod,
      value: input.value,
      isInitial: input.isInitial,
      amount,
      rateSource,
    },
  });

  return serialize(row);
}

// US-METER-03 — correct an erroneous monthly reading before its draft invoice
// is sent. Supersedes the old reading, preserves the original value, and
// recalculates the linked draft invoice.
export async function correctMeterReadingService(
  landlordId: string,
  readingId: string,
  newValue: number,
): Promise<MeterReadingView> {
  const original = await findMeterReadingById(readingId);
  if (!original) throw new NotFoundError("Meter reading not found.");
  if (original.isInitial) {
    throw new UnprocessableError(
      "Initial baseline readings cannot be corrected; record a monthly reading instead.",
    );
  }

  await assertRoomOwned(original.roomId, landlordId);

  const linked = await findActiveInvoiceForRoomPeriod(
    original.roomId,
    original.billingPeriod,
  );
  if (linked && linked.status !== "Draft") {
    throw new UnprocessableError(
      "This reading cannot be corrected because its invoice has already been sent or paid.",
    );
  }

  const prevVal = original.previousValue === null ? 0 : Number(original.previousValue);
  if (newValue < prevVal) {
    throw new UnprocessableError(
      "Corrected reading cannot be lower than the previous reading.",
      [
        {
          field: "value",
          message: "Must be greater than or equal to the previous reading.",
        },
      ],
    );
  }

  const cons = newValue - prevVal;
  const unitRate = original.unitRate ?? 0;
  const amount = roundVnd(cons * unitRate);
  const supersededAt = new Date();

  const newRow = await db.transaction(async (rawTrx) => {
    const trx = rawTrx as unknown as typeof db;
    const created = await createMeterReading(
      {
        roomId: original.roomId,
        utilityType: original.utilityType,
        billingPeriod: original.billingPeriod,
        value: toScale4(newValue),
        isInitial: false,
        previousValue: original.previousValue,
        consumption: toScale4(cons),
        unitRate: original.unitRate,
        amount,
        rateSource: original.rateSource,
        rateSourceId: original.rateSourceId,
        rateSourceReference: original.rateSourceReference,
        rateEffectiveFrom:
          original.rateEffectiveFrom === null
            ? null
            : String(original.rateEffectiveFrom),
        locality: original.locality,
        tenantCount: original.tenantCount,
        recordedBy: landlordId,
      },
      trx,
    );
    await supersedeReading(original.id, supersededAt, trx);
    return created;
  });

  await writeAudit({
    actorUserId: landlordId,
    action: "meter_reading.corrected",
    entityType: "meter_readings",
    entityId: newRow.id,
    beforeValue: {
      value: Number(original.value),
      amount: original.amount,
      correctionOf: null,
    },
    afterValue: {
      value: newValue,
      amount,
      correctionOf: original.id,
    },
  });

  await recalculateDraftInvoice(
    original.roomId,
    original.billingPeriod,
    landlordId,
  );

  return serialize(newRow);
}
