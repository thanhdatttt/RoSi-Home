import { ConflictError, NotFoundError, UnprocessableError } from "../../lib/errors.js";
import { writeAudit } from "../../db/audit.js";
import { db, type Db } from "../../db/index.js";
import { roundVnd } from "../../lib/money.js";
import { periodBounds } from "../../lib/billingPeriod.js";
import {
  resolveElectricityRate,
  resolveWaterRate,
  type ResolvedRate,
} from "../utilities/rateResolver.js";
import { countActiveLeasesForRoomPeriod } from "../leases/repository.js";
import {
  assertRoomOwned,
  createMeterReading,
  findActiveReading,
  findPreviousReading,
  findMeterReadingById,
  listActiveReadings,
  supersedeReading,
  type MeterReadingRow,
} from "./repository.js";
import type {
  CalculateMeterReadingsInput,
  MeterReadingInput,
} from "./schema.js";
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
  correctionOf: string | null;
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
    correctionOf: row.correctionOf,
    recordedBy: row.recordedBy,
    createdAt: row.createdAt.toISOString(),
  };
}

export type MonthlyMeterCalculationView = {
  electricity: MeterReadingView;
  water:
    | { method: "Metered"; reading: MeterReadingView; amount: number }
    | {
        method: "Flat";
        reading: null;
        flatAmountPerTenant: number;
        tenantCount: number;
        amount: number;
        rateSource: string;
        rateSourceId: string;
        rateSourceReference: string | null;
        rateEffectiveFrom: string;
        locality: string | null;
      };
  previousReadings: {
    electricity: number;
    water: number | null;
  };
};

function toScale4(n: number): string {
  return n.toFixed(4);
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    code?: string;
    cause?: { code?: string };
  };
  return candidate.code === "23505" || candidate.cause?.code === "23505";
}

function duplicateReadingConflict(): ConflictError {
  return new ConflictError(
    "An active reading for this room, utility, and billing period already exists.",
  );
}

async function createCalculatedReading(
  landlordId: string,
  roomId: string,
  locality: string | null,
  input: {
    utilityType: "Electricity" | "Water";
    billingPeriod: string;
    value: number;
    field: "electricityReading" | "waterReading";
  },
  rate: ResolvedRate,
  executor: Db,
): Promise<MeterReadingRow> {
  const existing = await findActiveReading(
    roomId,
    input.utilityType,
    input.billingPeriod,
    executor,
  );
  if (existing) {
    throw new ConflictError(
      `An active ${input.utilityType.toLowerCase()} reading already exists for this room and billing period.`,
    );
  }

  const previous = await findPreviousReading(
    roomId,
    input.utilityType,
    input.billingPeriod,
    executor,
  );
  if (!previous) {
    throw new UnprocessableError(
      `No preceding ${input.utilityType.toLowerCase()} reading found. Record the initial baseline first.`,
      [{ field: input.field, message: "A preceding baseline reading is required." }],
    );
  }

  const previousValue = Number(previous.value);
  if (input.value < previousValue) {
    throw new UnprocessableError(
      "Current reading cannot be lower than the previous reading.",
      [
        {
          field: input.field,
          message: "Reading cannot be lower than the previous reading.",
        },
      ],
    );
  }

  const consumption = input.value - previousValue;
  const unitRate =
    input.utilityType === "Electricity" ? rate.ratePerKwh! : rate.ratePerM3!;
  const amount = roundVnd(consumption * unitRate);
  const row = await createMeterReading(
    {
      roomId,
      utilityType: input.utilityType,
      billingPeriod: input.billingPeriod,
      value: toScale4(input.value),
      isInitial: false,
      previousValue: previous.value,
      consumption: toScale4(consumption),
      unitRate,
      amount,
      rateSource: rate.source,
      rateSourceId: rate.sourceId,
      rateSourceReference: rate.sourceReference,
      rateEffectiveFrom: rate.effectiveFrom,
      locality,
      tenantCount: null,
      correctionOf: null,
      recordedBy: landlordId,
    },
    executor,
  );

  await writeAudit(
    {
      actorUserId: landlordId,
      action: "meter_reading.created",
      entityType: "meter_readings",
      entityId: row.id,
      afterValue: {
        roomId,
        utilityType: input.utilityType,
        billingPeriod: input.billingPeriod,
        value: input.value,
        isInitial: false,
        amount,
        rateSource: rate.source,
      },
    },
    executor,
  );
  return row;
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

  let row: MeterReadingRow;
  try {
    row = await createMeterReading({
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
      correctionOf: null,
      recordedBy: landlordId,
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw duplicateReadingConflict();
    throw error;
  }

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

export async function listMeterReadingsService(
  landlordId: string,
  roomId: string,
  billingPeriod: string,
): Promise<MeterReadingView[]> {
  await assertRoomOwned(roomId, landlordId);
  const rows = await listActiveReadings(roomId, billingPeriod);
  return rows.map(serialize);
}

// US-METER-02 — persist the complete monthly calculation atomically. Metered
// water is recorded alongside electricity; flat water is calculated from the
// active tenant count without inventing a water meter reading.
export async function calculateMeterReadingsService(
  landlordId: string,
  roomId: string,
  input: CalculateMeterReadingsInput,
): Promise<MonthlyMeterCalculationView> {
  const { propertyId, locality } = await assertRoomOwned(roomId, landlordId);
  const { start: periodStart, end: periodEnd } = periodBounds(
    input.billingPeriod,
  );
  const [electricityRate, waterRate] = await Promise.all([
    resolveElectricityRate(propertyId, locality, periodEnd),
    resolveWaterRate(propertyId, locality, periodEnd),
  ]);

  if (waterRate.method === "Metered" && input.waterReading === undefined) {
    throw new UnprocessableError(
      "A water reading is required because this property uses metered water.",
      [{ field: "waterReading", message: "Water reading is required." }],
    );
  }
  try {
    return await db.transaction(async (rawTrx) => {
      const trx = rawTrx as unknown as Db;
      const electricityRow = await createCalculatedReading(
        landlordId,
        roomId,
        locality,
        {
          utilityType: "Electricity",
          billingPeriod: input.billingPeriod,
          value: input.electricityReading,
          field: "electricityReading",
        },
        electricityRate,
        trx,
      );

      if (waterRate.method === "Metered") {
        const waterRow = await createCalculatedReading(
          landlordId,
          roomId,
          locality,
          {
            utilityType: "Water",
            billingPeriod: input.billingPeriod,
            value: input.waterReading!,
            field: "waterReading",
          },
          waterRate,
          trx,
        );
        return {
          electricity: serialize(electricityRow),
          water: {
            method: "Metered" as const,
            reading: serialize(waterRow),
            amount: waterRow.amount,
          },
          previousReadings: {
            electricity: Number(electricityRow.previousValue),
            water: Number(waterRow.previousValue),
          },
        };
      }

      const tenantCount = await countActiveLeasesForRoomPeriod(
        roomId,
        periodStart,
        periodEnd,
        trx,
      );
      const flatAmountPerTenant = waterRate.flatAmountPerTenant!;
      return {
        electricity: serialize(electricityRow),
        water: {
          method: "Flat" as const,
          reading: null,
          flatAmountPerTenant,
          tenantCount,
          amount: roundVnd(flatAmountPerTenant * tenantCount),
          rateSource: waterRate.source,
          rateSourceId: waterRate.sourceId,
          rateSourceReference: waterRate.sourceReference,
          rateEffectiveFrom: waterRate.effectiveFrom,
          locality,
        },
        previousReadings: {
          electricity: Number(electricityRow.previousValue),
          water: null,
        },
      };
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw duplicateReadingConflict();
    throw error;
  }
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
  if (original.supersededAt !== null) {
    throw new UnprocessableError(
      "This meter reading has already been superseded by a correction.",
    );
  }
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
  if (!linked || linked.status !== "Draft") {
    throw new UnprocessableError(
      "This reading can only be corrected while its related invoice is still a draft.",
      undefined,
      "INVOICE_NOT_DRAFT",
    );
  }

  const prevVal = original.previousValue === null ? 0 : Number(original.previousValue);
  if (newValue < prevVal) {
    throw new UnprocessableError(
      "Corrected reading cannot be lower than the previous reading.",
      [
        {
          field: "correctedValue",
          message: "Must be greater than or equal to the previous reading.",
        },
      ],
    );
  }

  const cons = newValue - prevVal;
  const unitRate = original.unitRate ?? 0;
  const amount = roundVnd(cons * unitRate);
  const supersededAt = new Date();

  let newRow: MeterReadingRow;
  try {
    newRow = await db.transaction(async (rawTrx) => {
      const trx = rawTrx as unknown as Db;
      await supersedeReading(original.id, supersededAt, trx);
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
          correctionOf: original.id,
          recordedBy: landlordId,
        },
        trx,
      );
      await writeAudit(
        {
          actorUserId: landlordId,
          action: "meter_reading.corrected",
          entityType: "meter_readings",
          entityId: created.id,
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
        },
        trx,
      );
      return created;
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw duplicateReadingConflict();
    throw error;
  }

  await recalculateDraftInvoice(
    original.roomId,
    original.billingPeriod,
    landlordId,
  );

  return serialize(newRow);
}
