import { useState } from 'react';

import { Button, Field, Screen, Success, Title } from '@/ui';
import { useAuth } from '../hooks/use-auth';

export function ForgotPasswordScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  return (
    <Screen>
      <Title subtitle="Mật khẩu tạm thời sẽ được gửi qua email.">Quên mật khẩu</Title>
      {done ? <Success message="Đã gửi yêu cầu khôi phục" /> : null}
      <Field label="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Button
        label="Gửi yêu cầu"
        disabled={!email}
        onPress={async () => {
          await auth.forgotPassword(email);
          setDone(true);
        }}
      />
    </Screen>
  );
}
