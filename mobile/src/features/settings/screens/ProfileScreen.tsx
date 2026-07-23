import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Field, Screen, Success, Title } from '@/ui';
import { useProfile } from '../hooks/use-profile';

export function ProfileScreen() {
  const { profile, updateProfile } = useProfile();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [done, setDone] = useState(false);
  return (
    <Screen>
      <Title>Hồ sơ</Title>
      {done ? <Success message="Đã lưu hồ sơ" /> : null}
      <Field label="Họ và tên" value={name} onChangeText={setName} />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Button
        label="Lưu hồ sơ"
        onPress={async () => {
          await updateProfile({ name, email, phone });
          setDone(true);
        }}
      />
      <Button label="Đổi mật khẩu" variant="secondary" onPress={() => router.push('/change-password')} />
      <Button label="Đăng xuất" variant="danger" onPress={() => router.replace('/(auth)/login')} />
    </Screen>
  );
}
