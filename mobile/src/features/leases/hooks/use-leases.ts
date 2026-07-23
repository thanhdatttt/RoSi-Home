import { useLeasesRepository } from '../api/leases.repository';

export function useLeases() {
  return useLeasesRepository();
}

export function useLease(leaseId: string) {
  return useLeasesRepository().leases.find((lease) => lease.id === leaseId);
}
