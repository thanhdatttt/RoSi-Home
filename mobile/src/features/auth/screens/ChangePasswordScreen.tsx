import { router } from 'expo-router';
import { useState } from 'react';

import { useApiSession } from '@/core/api';
import { Button, Field, Notice, Screen, Success, Title } from '@/ui';
import { useAuth } from '../hooks/use-auth';

export function ChangePasswordScreen() {
  const auth = useAuth();
  const session = useApiSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Screen>
      <Title subtitle="Mật khẩu mới có ít nhất 8 ký tự.">Đổi mật khẩu</Title>
      {done ? <Success message="Đã cập nhật mật khẩu" /> : null}
      {error ? <Notice title="Không thể đổi mật khẩu" message={error} /> : null}
      <Field label="Mật khẩu hiện tại" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
      <Field
        label="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        error={newPassword && newPassword.length < 8 ? 'Cần ít nhất 8 ký tự' : undefined}
      />
      <Field
        label="Nhập lại mật khẩu"
        value={confirmation}
        onChangeText={setConfirmation}
        secureTextEntry
        error={confirmation && newPassword !== confirmation ? 'Mật khẩu không khớp' : undefined}
      />
      <Button
        label="Cập nhật mật khẩu"
        disabled={
          loading ||
          !currentPassword ||
          newPassword.length < 8 ||
          newPassword !== confirmation
        }
        onPress={async () => {
          setLoading(true);
          setError(null);
          try {
            const wasRequired = session.user?.mustChangePassword === true;
            await auth.changePassword({ currentPassword, newPassword });
            setDone(true);
            if (wasRequired) {
              router.replace('/(tabs)/home');
            }
          } catch (requestError) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : 'Không thể đổi mật khẩu.',
            );
          } finally {
            setLoading(false);
          }
        }}
      />
    </Screen>
  );
}
