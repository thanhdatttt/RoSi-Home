import {
  apiRequest,
  apiRequestWithEnvelope,
  type ApiListEnvelope,
} from '@/lib/api';

type AccessToken = string | null;

export type TenantView = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
  createdByLandlordId: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateTenantInput = Pick<TenantView, 'fullName' | 'phone' | 'email' | 'idNumber'>;

export type LeaseView = {
  id: string;
  roomId: string;
  roomName: string;
  propertyId: string;
  propertyName: string;
  tenantInfoId: string;
  tenantId: string | null;
  tenant: { fullName: string; phone: string; email: string };
  startDate: string;
  endDate: string;
  actualEndDate: string | null;
  agreedRent: number;
  deposit: number;
  status: 'Active' | 'Ended' | 'Expired';
  createdBy: string;
  endedBy: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLeaseInput = {
  roomId: string;
  tenant: { fullName: string; phone: string; idNumber: string; email: string };
  startDate: string;
  endDate: string;
  agreedRent: number;
  deposit: number;
};

export type UpdateLeaseInput = {
  endDate?: string;
  agreedRent?: number;
  deposit?: number;
  renewalStartDate?: string;
  renewalEndDate?: string;
};

export type LeaseProvisioningMeta = {
  tenantAccountProvisioned: boolean;
  tempPassword?: string;
};

export type UpcomingExpirationView = {
  leaseId: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  tenantFullName: string;
  endDate: string;
};

export type LeaseReminderConfigView = {
  propertyId: string;
  remindAt30Days: boolean;
  remindAt15Days: boolean;
  remindAt7Days: boolean;
};

export type LeaseReminderConfigInput = Omit<LeaseReminderConfigView, 'propertyId'>;

export function listTenants(token: AccessToken, page = 1, pageSize = 100) {
  return apiRequestWithEnvelope<TenantView[]>(`/tenants?page=${page}&pageSize=${pageSize}`, {
    token,
  }) as Promise<ApiListEnvelope<TenantView>>;
}

export function getTenant(token: AccessToken, tenantId: string) {
  return apiRequest<TenantView>(`/tenants/${tenantId}`, { token });
}

export function updateTenant(token: AccessToken, tenantId: string, input: UpdateTenantInput) {
  return apiRequest<TenantView>(`/tenants/${tenantId}`, { method: 'PATCH', token, body: input });
}

export function archiveTenant(token: AccessToken, tenantId: string) {
  return apiRequest<{ success: true }>(`/tenants/${tenantId}`, { method: 'DELETE', token });
}

export function listLeases(token: AccessToken, page = 1, pageSize = 100) {
  return apiRequestWithEnvelope<LeaseView[]>(`/leases?page=${page}&pageSize=${pageSize}`, {
    token,
  }) as Promise<ApiListEnvelope<LeaseView>>;
}

export function getLease(token: AccessToken, leaseId: string) {
  return apiRequest<LeaseView>(`/leases/${leaseId}`, { token });
}

export function createLease(token: AccessToken, input: CreateLeaseInput) {
  return apiRequestWithEnvelope<LeaseView, LeaseProvisioningMeta>('/leases', {
    method: 'POST',
    token,
    body: input,
  });
}

export function updateLease(token: AccessToken, leaseId: string, input: UpdateLeaseInput) {
  return apiRequest<LeaseView>(`/leases/${leaseId}`, { method: 'PATCH', token, body: input });
}

export function endLease(token: AccessToken, leaseId: string, actualEndDate: string) {
  return apiRequest<LeaseView>(`/leases/${leaseId}/end`, {
    method: 'POST',
    token,
    body: { actualEndDate },
  });
}

export function listUpcomingExpirations(token: AccessToken) {
  return apiRequest<UpcomingExpirationView[]>('/leases/upcoming-expirations', { token });
}

export function getLeaseReminderConfig(token: AccessToken, propertyId: string) {
  return apiRequest<LeaseReminderConfigView>(
    `/properties/${propertyId}/lease-reminder-config`,
    { token },
  );
}

export function updateLeaseReminderConfig(
  token: AccessToken,
  propertyId: string,
  input: LeaseReminderConfigInput,
) {
  return apiRequest<LeaseReminderConfigView>(
    `/properties/${propertyId}/lease-reminder-config`,
    { method: 'PATCH', token, body: input },
  );
}
