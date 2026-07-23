import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Field, Screen, Title, colors, spacing } from '@/ui';
import { useAuth } from '../hooks/use-auth';

export function LoginScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState('chunha@rosihome.vn');
  const [password, setPassword] = useState('matkhau123');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await auth.login({ email, password });
    setLoading(false);
    router.replace('/(tabs)/home');
  };

  return (
    <Screen>
      <View style={styles.logo}><Text style={styles.logoText}>R</Text></View>
      <Title subtitle="Đăng nhập để tiếp tục quản lý nhà trọ.">Chào mừng trở lại</Title>
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
      <Button label={loading ? 'Đang đăng nhập…' : 'Đăng nhập'} disabled={loading} onPress={submit} />
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
