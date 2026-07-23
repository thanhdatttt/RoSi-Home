import { useState } from 'react';

import { Button, Field, Screen, Success, Title } from '@/ui';
import { useAuth } from '../hooks/use-auth';

export function ChangePasswordScreen() {
  const auth = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [done, setDone] = useState(false);
  return (
    <Screen>
      <Title subtitle="Mật khẩu mới có ít nhất 8 ký tự.">Đổi mật khẩu</Title>
      {done ? <Success message="Đã cập nhật mật khẩu" /> : null}
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
        disabled={!currentPassword || newPassword.length < 8 || newPassword !== confirmation}
        onPress={async () => {
          await auth.changePassword({ currentPassword, newPassword });
          setDone(true);
        }}
      />
    </Screen>
  );
}
