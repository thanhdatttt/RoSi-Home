import { useState } from 'react';

import { Button, Field, Notice, Screen, Success, Title } from '@/ui';
import { useAuth } from '../hooks/use-auth';

export function ForgotPasswordScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Screen>
      <Title subtitle="Mật khẩu tạm thời sẽ được gửi qua email.">Quên mật khẩu</Title>
      {done ? <Success message="Đã gửi yêu cầu khôi phục" /> : null}
      {error ? <Notice title="Không thể gửi yêu cầu" message={error} /> : null}
      <Field label="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Button
        label="Gửi yêu cầu"
        disabled={!email || loading}
        onPress={async () => {
          setLoading(true);
          setError(null);
          try {
            await auth.forgotPassword(email);
            setDone(true);
          } catch (requestError) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : 'Không thể gửi yêu cầu.',
            );
          } finally {
            setLoading(false);
          }
        }}
      />
    </Screen>
  );
}
