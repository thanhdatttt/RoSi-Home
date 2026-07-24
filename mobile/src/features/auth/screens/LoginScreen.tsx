import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Field, Notice, Screen, Title, colors, spacing } from '@/ui';
import { useAuth } from '../hooks/use-auth';

export function LoginScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await auth.login({ email, password });
      if (user.role !== 'Landlord') {
        await auth.logout();
        setError(
          'Ứng dụng mobile hiện chỉ có giao diện chủ nhà. Tài khoản người thuê chưa được hỗ trợ.',
        );
        return;
      }
      router.replace(
        user.mustChangePassword ? '/(auth)/change-password' : '/(tabs)/home',
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể đăng nhập.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.logo}><Text style={styles.logoText}>R</Text></View>
      <Title subtitle="Đăng nhập để tiếp tục quản lý nhà trọ.">Chào mừng trở lại</Title>
      {error ? <Notice title="Không thể đăng nhập" message={error} /> : null}
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
      <Button
        label={loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        disabled={loading || !email || !password}
        onPress={submit}
      />
      <Button label="Quên mật khẩu?" variant="secondary" onPress={() => router.push('/(auth)/forgot-password')} />
      <Button label="Đăng ký chủ nhà" variant="secondary" onPress={() => router.push('/(auth)/register')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  logoText: { color: colors.surface, fontSize: 28, fontWeight: '900' },
});
