import {
  apiRequest,
  apiRequestWithEnvelope,
  type ApiListEnvelope,
} from '@/lib/api';

type AccessToken = string | null;

export type PropertyView = {
  id: string;
  name: string;
  address: string;
  locality: string | null;
  createdAt: string;
  updatedAt: string;
  units: number;
  occupied: number;
};

export type RoomView = {
  id: string;
  propertyId: string;
  name: string;
  baseRent: number;
  status: 'Vacant' | 'Occupied';
  createdAt: string;
  updatedAt: string;
};

export type UtilityRateView = {
  id: string;
  propertyId: string;
  electricityRatePerKwh: number;
  waterBillingMethod: 'Metered' | 'Flat';
  waterRatePerM3: number | null;
  waterFlatAmountPerTenant: number | null;
  effectiveFrom: string;
  createdBy: string;
  createdAt: string;
};

export type PropertyUtilityRatesView = {
  current: UtilityRateView | null;
  upcoming: UtilityRateView | null;
};

export type ScheduleUtilityRateInput = Omit<
  UtilityRateView,
  'id' | 'propertyId' | 'createdBy' | 'createdAt'
>;

export type SurchargeView = {
  id: string;
  propertyId: string;
  name: string;
  monthlyAmount: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type GroupedSurchargeView = {
  name: string;
  current: SurchargeView | null;
  upcoming: SurchargeView | null;
};

export type CreateSurchargeInput = Pick<SurchargeView, 'name' | 'monthlyAmount' | 'effectiveFrom'> & {
  effectiveTo?: string | null;
};

export type UpdateSurchargeInput = Partial<CreateSurchargeInput>;

export type UtilityRatesInput = {
  electricityRatePerKwh: number;
  waterBillingMethod: 'Metered' | 'Flat';
  waterRatePerM3?: number;
  waterFlatAmountPerTenant?: number;
};

export type CreatePropertyInput = {
  name: string;
  address: string;
  locality?: string;
  utilityRates: UtilityRatesInput;
  surcharges?: { name: string; monthlyAmount: number }[];
};

export type UpdatePropertyInput = Pick<CreatePropertyInput, 'name' | 'address'> & {
  locality?: string;
};

export type CreateRoomInput = { name: string; baseRent: number };

export function listProperties(
  token: AccessToken,
  page: number,
  pageSize: number,
): Promise<ApiListEnvelope<PropertyView>> {
  return apiRequestWithEnvelope<PropertyView[]>(
    `/properties?page=${page}&pageSize=${pageSize}`,
    { token },
  ) as Promise<ApiListEnvelope<PropertyView>>;
}

export function getProperty(token: AccessToken, propertyId: string) {
  return apiRequest<PropertyView>(`/properties/${propertyId}`, { token });
}

export function createProperty(token: AccessToken, input: CreatePropertyInput) {
  return apiRequest<PropertyView>('/properties', { method: 'POST', token, body: input });
}

export function updateProperty(
  token: AccessToken,
  propertyId: string,
  input: UpdatePropertyInput,
) {
  return apiRequest<PropertyView>(`/properties/${propertyId}`, {
    method: 'PATCH',
    token,
    body: input,
  });
}

export function deleteProperty(token: AccessToken, propertyId: string) {
  return apiRequest<{ success: true }>(`/properties/${propertyId}`, {
    method: 'DELETE',
    token,
  });
}

export function listRooms(
  token: AccessToken,
  propertyId: string,
  page: number,
  pageSize: number,
): Promise<ApiListEnvelope<RoomView>> {
  return apiRequestWithEnvelope<RoomView[]>(
    `/rooms/properties/${propertyId}?page=${page}&pageSize=${pageSize}`,
    { token },
  ) as Promise<ApiListEnvelope<RoomView>>;
}

export function getRoom(token: AccessToken, roomId: string) {
  return apiRequest<RoomView>(`/rooms/${roomId}`, { token });
}

export function createRoom(
  token: AccessToken,
  propertyId: string,
  input: CreateRoomInput,
) {
  return apiRequest<RoomView>(`/rooms/properties/${propertyId}`, {
    method: 'POST',
    token,
    body: input,
  });
}

export function bulkCreateRooms(
  token: AccessToken,
  propertyId: string,
  rooms: CreateRoomInput[],
) {
  return apiRequest<{ created: RoomView[] }>(`/rooms/properties/${propertyId}/bulk`, {
    method: 'POST',
    token,
    body: { rooms },
  });
}

export function updateRoom(token: AccessToken, roomId: string, input: CreateRoomInput) {
  return apiRequest<RoomView>(`/rooms/${roomId}`, {
    method: 'PATCH',
    token,
    body: input,
  });
}

export function deleteRoom(token: AccessToken, roomId: string) {
  return apiRequest<{ success: true }>(`/rooms/${roomId}`, {
    method: 'DELETE',
    token,
  });
}

export function getPropertyUtilityRates(token: AccessToken, propertyId: string) {
  return apiRequest<PropertyUtilityRatesView>(
    `/utilities/properties/${propertyId}/utility-rates`,
    { token },
  );
}

export function schedulePropertyUtilityRate(
  token: AccessToken,
  propertyId: string,
  input: ScheduleUtilityRateInput,
) {
  return apiRequest<UtilityRateView>(
    `/utilities/properties/${propertyId}/utility-rates`,
    { method: 'POST', token, body: input },
  );
}

export function cancelPropertyUtilityRate(
  token: AccessToken,
  propertyId: string,
  rateId: string,
) {
  return apiRequest<{ success: true }>(
    `/utilities/properties/${propertyId}/utility-rates/${rateId}`,
    { method: 'DELETE', token },
  );
}

export function listPropertySurcharges(
  token: AccessToken,
  propertyId: string,
  page = 1,
  pageSize = 100,
): Promise<ApiListEnvelope<GroupedSurchargeView>> {
  return apiRequestWithEnvelope<GroupedSurchargeView[]>(
    `/charges/properties/${propertyId}/surcharges?page=${page}&pageSize=${pageSize}`,
    { token },
  ) as Promise<ApiListEnvelope<GroupedSurchargeView>>;
}

export function createPropertySurcharge(
  token: AccessToken,
  propertyId: string,
  input: CreateSurchargeInput,
) {
  return apiRequest<SurchargeView>(`/charges/properties/${propertyId}/surcharges`, {
    method: 'POST',
    token,
    body: input,
  });
}

export function updatePropertySurcharge(
  token: AccessToken,
  surchargeId: string,
  input: UpdateSurchargeInput,
) {
  return apiRequest<SurchargeView>(`/charges/${surchargeId}`, {
    method: 'PATCH',
    token,
    body: input,
  });
}

export function deletePropertySurcharge(token: AccessToken, surchargeId: string) {
  return apiRequest<{ success: true }>(`/charges/${surchargeId}`, {
    method: 'DELETE',
    token,
  });
}
