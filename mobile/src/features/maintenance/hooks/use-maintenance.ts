import { useMaintenanceRepository } from '../api/maintenance.repository';

export function useMaintenanceRequests() {
  return useMaintenanceRepository();
}

export function useMaintenanceRequest(requestId: string) {
  return useMaintenanceRepository().requests.find((request) => request.id === requestId);
}
