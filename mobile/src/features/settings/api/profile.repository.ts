export type Profile = { name: string; email: string; phone: string };

export interface ProfileRepository {
  profile: Profile;
  updateProfile(value: Profile): Promise<void>;
}

const mockProfile: Profile = {
  name: 'Nguyễn Minh An',
  email: 'chunha@rosihome.vn',
  phone: '0901 234 567',
};

export function useProfileRepository(): ProfileRepository {
  return { profile: mockProfile, updateProfile: async () => undefined };
}
