import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { Lease } from '../models/lease';

export interface LeasesRepository {
  leases: Lease[];
  loading: boolean;
  error: string | null;
  createLease(value: Omit<Lease, 'id' | 'status'>): Promise<string>;
}

export function useLeasesRepository(): LeasesRepository {
  const { leases, loading, error, addLease } = useMockAppData();
  return { leases, loading, error, createLease: addLease };
}
