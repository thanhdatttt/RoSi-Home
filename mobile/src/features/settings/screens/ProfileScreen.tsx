import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { Button, Feedback, Field, Notice, Screen, Success, Title } from '@/ui';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfile } from '../hooks/use-profile';

export function ProfileScreen() {
  const auth = useAuth();
  const { profile, loading, error, updateProfile } = useProfile();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
  }, [profile]);

  if (loading) {
    return <Screen><Feedback type="loading" /></Screen>;
  }

  return (
    <Screen>
      <Title>Hồ sơ</Title>
      {done ? <Success message="Đã lưu hồ sơ" /> : null}
      {error || savingError ? (
        <Notice
          title="Không thể đồng bộ hồ sơ"
          message={savingError ?? error ?? ''}
        />
      ) : null}
      <Field label="Họ và tên" value={name} onChangeText={setName} />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        editable={false}
        hint="Backend hiện chưa hỗ trợ đổi email."
      />
      <Field label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Button
        label={saving ? 'Đang lưu hồ sơ…' : 'Lưu hồ sơ'}
        disabled={saving || !name || !phone}
        onPress={async () => {
          setSaving(true);
          setSavingError(null);
          try {
            await updateProfile({ name, email, phone });
            setDone(true);
          } catch (requestError) {
            setSavingError(
              requestError instanceof Error
                ? requestError.message
                : 'Không thể lưu hồ sơ.',
            );
          } finally {
            setSaving(false);
          }
        }}
      />
      <Button label="Đổi mật khẩu" variant="secondary" onPress={() => router.push('/change-password')} />
      <Button
        label="Đăng xuất"
        variant="danger"
        onPress={async () => {
          await auth.logout();
          router.replace('/(auth)/login');
        }}
      />
    </Screen>
  );
}
