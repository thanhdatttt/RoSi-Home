import { AuthUser, useApiSession } from '@/core/api';

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};
export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export interface AuthRepository {
  login(input: LoginInput): Promise<AuthUser>;
  register(input: RegisterInput): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  changePassword(input: ChangePasswordInput): Promise<void>;
  logout(): Promise<void>;
}

export function useAuthRepository(): AuthRepository {
  const session = useApiSession();
  return {
    login: ({ email, password }) => session.login(email, password),
    register: ({ name, email, password }) =>
      session.register({ fullName: name, email, password }),
    forgotPassword: session.forgotPassword,
    changePassword: ({ currentPassword, newPassword }) =>
      session.changePassword(currentPassword, newPassword),
    logout: session.logout,
  };
}
