import { useEffect, useState } from 'react';

import { ApiEnvelope, useApiSession } from '@/core/api';

export type Profile = { name: string; email: string; phone: string };

type ProfileDto = {
  fullName: string;
  email: string;
  phone: string | null;
};

export interface ProfileRepository {
  profile: Profile;
  loading: boolean;
  error: string | null;
  updateProfile(value: Profile): Promise<void>;
}

const mockProfile: Profile = {
  name: 'Nguyễn Minh An',
  email: 'chunha@rosihome.vn',
  phone: '0901 234 567',
};

export function useProfileRepository(): ProfileRepository {
  const { enabled, authenticated, client } = useApiSession();
  const [profile, setProfile] = useState<Profile>(
    enabled ? { name: '', email: '', phone: '' } : mockProfile,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !authenticated) return;
    let active = true;
    setLoading(true);
    setError(null);
    void client
      .request<ApiEnvelope<ProfileDto>>({ path: '/api/v1/profile' })
      .then((response) => {
        if (!active) return;
        setProfile({
          name: response.data.fullName,
          email: response.data.email,
          phone: response.data.phone ?? '',
        });
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Không thể tải hồ sơ.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authenticated, client, enabled]);

  return {
    profile,
    loading,
    error,
    updateProfile: async (value) => {
      if (!enabled) {
        setProfile(value);
        return;
      }
      const response = await client.request<ApiEnvelope<ProfileDto>>({
        method: 'PATCH',
        path: '/api/v1/profile',
        body: { fullName: value.name, phone: value.phone },
      });
      setProfile({
        name: response.data.fullName,
        email: response.data.email,
        phone: response.data.phone ?? '',
      });
    },
  };
}
