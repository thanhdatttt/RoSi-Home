import { apiRequest, apiRequestWithEnvelope, type ApiListMeta } from "@/lib/api";

export type UtilityType = "Electricity" | "Water";
export type MeterReading = {
  id: string; roomId: string; utilityType: UtilityType; billingPeriod: string;
  value: number; isInitial: boolean; previousValue: number | null;
  consumption: number | null; unitRate: number | null; amount: number;
  rateSource: string | null; createdAt: string; correctionOf: string | null;
};

export async function listMeterReadings(token: string | null, roomId: string, billingPeriod?: string) {
  const query = billingPeriod ? `&billingPeriod=${encodeURIComponent(billingPeriod)}` : "";
  return apiRequestWithEnvelope<MeterReading[], ApiListMeta>(`/rooms/${roomId}/meter-readings?page=1&pageSize=100${query}`, { token });
}

export function recordMeterReading(token: string | null, roomId: string, input: { utilityType: UtilityType; billingPeriod: string; value: number; isInitial: boolean }) {
  return apiRequest<MeterReading>(`/rooms/${roomId}/meter-readings`, { method: "POST", token, body: input });
}

export function correctMeterReading(token: string | null, readingId: string, value: number) {
  return apiRequest<MeterReading>(`/meter-readings/${readingId}/correct`, { method: "POST", token, body: { value } });
}
