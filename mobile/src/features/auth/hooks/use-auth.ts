import { useAuthRepository } from '../api/auth.repository';

export function useAuth() {
  return useAuthRepository();
}
