import { useProfileRepository } from '../api/profile.repository';

export function useProfile() {
  return useProfileRepository();
}
