import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { MaintenanceRequest, MaintenanceStatus } from '../models/maintenance';

export interface MaintenanceRepository {
  requests: MaintenanceRequest[];
  loading: boolean;
  error: string | null;
  updateStatus(id: string, status: MaintenanceStatus): Promise<void>;
}

export function useMaintenanceRepository(): MaintenanceRepository {
  const { maintenanceRequests, loading, error, updateMaintenanceStatus } =
    useMockAppData();
  return {
    requests: maintenanceRequests,
    loading,
    error,
    updateStatus: updateMaintenanceStatus,
  };
}
