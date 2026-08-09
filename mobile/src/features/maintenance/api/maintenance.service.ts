import { ApiClient, ApiEnvelope, ApiListEnvelope } from '@/core/api';

import { CreateMaintenanceRequestInput } from '../models/maintenance';
import { MaintenanceRequestDto } from './maintenance.dto';
import { toMaintenanceRequest } from './maintenance.mapper';

export async function createMaintenanceRequest(
  client: ApiClient,
  input: CreateMaintenanceRequestInput,
) {
  const body = new FormData();
  body.append('roomId', input.roomId);
  body.append('title', input.title.trim());
  body.append('description', input.description.trim());

  input.photos.forEach((photo) => {
    const nativeFile = {
      uri: photo.uri,
      name: photo.name,
      type: photo.mimeType,
    };
    body.append('photos', nativeFile as unknown as Blob);
  });

  const response = await client.request<ApiEnvelope<MaintenanceRequestDto>>({
    method: 'POST',
    path: '/api/v1/maintenance-requests',
    body,
  });
  return toMaintenanceRequest(response.data);
}

export async function getMaintenanceRequest(
  client: ApiClient,
  requestId: string,
) {
  const response = await client.request<ApiEnvelope<MaintenanceRequestDto>>({
    path: `/api/v1/maintenance-requests/${requestId}`,
  });
  return toMaintenanceRequest(response.data);
}

export async function getRoomMaintenanceRequests(
  client: ApiClient,
  roomId: string,
) {
  const response = await client.request<ApiListEnvelope<MaintenanceRequestDto>>({
    path: `/api/v1/rooms/${roomId}/maintenance-requests?page=1&pageSize=100`,
  });
  return response.data.map(toMaintenanceRequest);
}
