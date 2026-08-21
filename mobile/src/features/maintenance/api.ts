import { apiRequest, apiRequestWithEnvelope, type ApiListMeta } from "@/lib/api";

export type MaintenanceStatus = "Pending" | "InProgress" | "Completed";
export type MaintenancePhoto = { id: string; fileUrl: string };
export type TenantMaintenanceRequest = { id: string; title: string; description: string; room: { id: string; name: string }; status: MaintenanceStatus; submittedAt: string; photos: MaintenancePhoto[] };
export type LandlordMaintenanceRequest = TenantMaintenanceRequest & { property: { id: string; name: string }; tenant: { id: string; fullName: string } };
export type MaintenanceRequest = TenantMaintenanceRequest | LandlordMaintenanceRequest;
export type RoomMaintenanceHistoryItem = { id: string; title: string; requester: { id: string; fullName: string }; submittedAt: string; status: MaintenanceStatus; statusHistory: { id: string; fromStatus: string; toStatus: string; changedBy: string; changedAt: string }[] };
export type MaintenanceAttachment = { uri: string; name: string; mimeType: "image/jpeg" | "image/png"; fileSize?: number };

export async function listMaintenanceRequests(token: string | null, filters: { status?: MaintenanceStatus; propertyId?: string } = {}) {
  const params = new URLSearchParams({ page: "1", pageSize: "100" });
  if (filters.status) params.set("status", filters.status);
  if (filters.propertyId) params.set("propertyId", filters.propertyId);
  return apiRequestWithEnvelope<MaintenanceRequest[], ApiListMeta>(`/maintenance-requests?${params}`, { token });
}

export function getMaintenanceRequest(token: string | null, id: string) {
  return apiRequest<MaintenanceRequest>(`/maintenance-requests/${id}`, { token });
}

export function updateMaintenanceStatus(token: string | null, id: string, status: MaintenanceStatus) {
  return apiRequest<{ id: string; previousStatus: MaintenanceStatus; status: MaintenanceStatus; completedAt: string | null; updatedAt: string }>(`/maintenance-requests/${id}/status`, { method: "PATCH", token, body: { status } });
}

export function submitMaintenanceRequest(token: string | null, input: { roomId: string; title: string; description: string; photos: MaintenanceAttachment[] }) {
  const body = new FormData();
  body.append("roomId", input.roomId); body.append("title", input.title); body.append("description", input.description);
  for (const photo of input.photos) body.append("photos", { uri: photo.uri, name: photo.name, type: photo.mimeType } as unknown as Blob);
  return apiRequest(`/maintenance-requests`, { method: "POST", token, body, timeoutMs: 30_000 });
}

export function listRoomMaintenanceHistory(token: string | null, roomId: string) {
  return apiRequestWithEnvelope<RoomMaintenanceHistoryItem[], ApiListMeta>(`/rooms/${roomId}/maintenance-requests?page=1&pageSize=100`, { token });
}
