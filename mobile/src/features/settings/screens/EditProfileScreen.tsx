import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  Button,
  Feedback,
  Field,
  Notice,
  Screen,
  Success,
  Title,
} from '@/ui';

import { useProfile } from '../hooks/use-profile';

export function EditProfileScreen() {
  const { profile, loading, error, updateProfile } = useProfile();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
  }, [profile]);

  if (loading) return <Screen><Feedback type="loading" /></Screen>;

  return (
    <Screen>
      <Title subtitle="Chỉ các trường backend cho phép mới có thể chỉnh sửa.">
        Chỉnh sửa hồ sơ
      </Title>
      {saved ? <Success message="Đã lưu hồ sơ" /> : null}
      {error || savingError ? (
        <Notice
          title="Không thể lưu hồ sơ"
          message={savingError ?? error ?? ''}
        />
      ) : null}
      <Field
        label="Họ và tên"
        value={name}
        onChangeText={setName}
        error={!name.trim() ? 'Vui lòng nhập họ tên' : undefined}
      />
      <Field
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        error={!phone.trim() ? 'Vui lòng nhập số điện thoại' : undefined}
      />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        editable={false}
        hint="Email đăng nhập không thể thay đổi tại đây."
      />
      <Button
        label={saving ? 'Đang lưu thay đổi…' : 'Lưu thay đổi'}
        disabled={saving || !name.trim() || !phone.trim()}
        onPress={async () => {
          setSaving(true);
          setSavingError(null);
          try {
            await updateProfile({ name: name.trim(), email, phone: phone.trim() });
            setSaved(true);
            setTimeout(() => router.back(), 650);
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
    </Screen>
  );
}
