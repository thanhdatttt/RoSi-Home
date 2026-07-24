import { useState } from 'react';

import { Button, Field, Notice, Screen, Success, Title } from '@/ui';
import { useAuth } from '../hooks/use-auth';

export function RegisterScreen() {
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalid =
    !name ||
    !email ||
    password.length < 8 ||
    !/[A-Za-z]/.test(password) ||
    !/[0-9]/.test(password);

  return (
    <Screen>
      <Title subtitle="Tạo tài khoản dành cho chủ nhà.">Đăng ký</Title>
      {done ? <Success message="Đã tạo tài khoản" /> : null}
      {error ? <Notice title="Không thể đăng ký" message={error} /> : null}
      <Field label="Họ và tên *" value={name} onChangeText={setName} error={!name ? 'Không được để trống' : undefined} />
      <Field label="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Mật khẩu *" value={password} onChangeText={setPassword} secureTextEntry hint="Ít nhất 8 ký tự" />
      <Button
        label={loading ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
        disabled={invalid || loading}
        onPress={async () => {
          setLoading(true);
          setError(null);
          try {
            await auth.register({ name, email, password });
            setDone(true);
          } catch (requestError) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : 'Không thể đăng ký.',
            );
          } finally {
            setLoading(false);
          }
        }}
      />
    </Screen>
  );
}
