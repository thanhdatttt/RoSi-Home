import { mockAuthRepository } from '../api/auth.repository';

export function useAuth() {
  return mockAuthRepository;
}
