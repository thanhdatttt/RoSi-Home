import { useState } from 'react';

import { Button, Field, Screen, Success, Title } from '@/ui';
import { useAuth } from '../hooks/use-auth';

export function RegisterScreen() {
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const invalid = !name || !email || !phone || password.length < 8;

  return (
    <Screen>
      <Title subtitle="Tạo tài khoản dành cho chủ nhà.">Đăng ký</Title>
      {done ? <Success message="Đã tạo tài khoản mẫu" /> : null}
      <Field label="Họ và tên *" value={name} onChangeText={setName} error={!name ? 'Không được để trống' : undefined} />
      <Field label="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Số điện thoại *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="Mật khẩu *" value={password} onChangeText={setPassword} secureTextEntry hint="Ít nhất 8 ký tự" />
      <Button
        label="Tạo tài khoản"
        disabled={invalid}
        onPress={async () => {
          await auth.register({ name, email, phone, password });
          setDone(true);
        }}
      />
    </Screen>
  );
}
