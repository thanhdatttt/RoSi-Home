import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { MaintenanceRequest, MaintenanceStatus } from '../models/maintenance';

export interface MaintenanceRepository {
  requests: MaintenanceRequest[];
  updateStatus(id: string, status: MaintenanceStatus): void;
}

export function useMaintenanceRepository(): MaintenanceRepository {
  const { maintenanceRequests, updateMaintenanceStatus } = useMockAppData();
  return { requests: maintenanceRequests, updateStatus: updateMaintenanceStatus };
}
