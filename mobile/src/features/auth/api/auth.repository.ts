export type LoginInput = { email: string; password: string };
export type RegisterInput = { name: string; email: string; phone: string; password: string };
export type ChangePasswordInput = { currentPassword: string; newPassword: string };

export interface AuthRepository {
  login(input: LoginInput): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  changePassword(input: ChangePasswordInput): Promise<void>;
}

export const mockAuthRepository: AuthRepository = {
  login: async () => undefined,
  register: async () => undefined,
  forgotPassword: async () => undefined,
  changePassword: async () => undefined,
};
