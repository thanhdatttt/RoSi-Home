import { ApiClient, ApiEnvelope } from '@/core/api';

export type MeterUtilityType = 'Electricity' | 'Water';

export type MeterReadingView = {
  id: string;
  roomId: string;
  utilityType: MeterUtilityType;
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

export type MonthlyMeterCalculation = {
  electricity: MeterReadingView;
  water:
    | { method: 'Metered'; reading: MeterReadingView; amount: number }
    | {
        method: 'Flat';
        reading: null;
        flatAmountPerTenant: number;
        tenantCount: number;
        amount: number;
      };
  previousReadings: {
    electricity: number;
    water: number | null;
  };
};

export async function recordInitialMeterReading(
  client: ApiClient,
  input: {
    roomId: string;
    utilityType: MeterUtilityType;
    billingPeriod: string;
    value: number;
  },
) {
  const response = await client.request<ApiEnvelope<MeterReadingView>>({
    method: 'POST',
    path: `/api/v1/rooms/${input.roomId}/meter-readings`,
    body: {
      utilityType: input.utilityType,
      billingPeriod: input.billingPeriod,
      value: input.value,
      isInitial: true,
    },
  });
  return response.data;
}

export async function calculateMonthlyMeterReadings(
  client: ApiClient,
  input: {
    roomId: string;
    billingPeriod: string;
    electricityReading: number;
    waterReading?: number;
  },
) {
  const response = await client.request<ApiEnvelope<MonthlyMeterCalculation>>({
    method: 'POST',
    path: `/api/v1/rooms/${input.roomId}/meter-readings/calculate`,
    body: {
      billingPeriod: input.billingPeriod,
      electricityReading: input.electricityReading,
      ...(input.waterReading === undefined
        ? {}
        : { waterReading: input.waterReading }),
    },
  });
  return response.data;
}

export async function listMeterReadings(
  client: ApiClient,
  roomId: string,
  billingPeriod: string,
) {
  const response = await client.request<ApiEnvelope<MeterReadingView[]>>({
    path: `/api/v1/rooms/${roomId}/meter-readings?billingPeriod=${encodeURIComponent(billingPeriod)}`,
  });
  return response.data;
}

export async function correctMeterReading(
  client: ApiClient,
  readingId: string,
  correctedValue: number,
) {
  const response = await client.request<ApiEnvelope<MeterReadingView>>({
    method: 'POST',
    path: `/api/v1/meter-readings/${readingId}/correct`,
    body: { value: correctedValue },
  });
  return response.data;
}
