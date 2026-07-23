import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { Lease } from '../models/lease';

export interface LeasesRepository {
  leases: Lease[];
  createLease(value: Omit<Lease, 'id' | 'status'>): string;
}

export function useLeasesRepository(): LeasesRepository {
  const { leases, addLease } = useMockAppData();
  return { leases, createLease: addLease };
}
