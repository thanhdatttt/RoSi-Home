import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ApiSessionProvider, useApiSession } from '@/core/api';
import { AppDataProvider } from '@/core/data';
import { colors } from '@/ui';

function AppNavigator() {
  const { authenticated, user } = useApiSession();
  const passwordChangeRequired = user?.mustChangePassword === true;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          headerBackTitle: 'Quay lại',
        }}
      >
        <Stack.Protected guard={!authenticated || passwordChangeRequired}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={authenticated && !passwordChangeRequired}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="property-form" options={{ title: 'Bất động sản' }} />
          <Stack.Screen name="property-detail" options={{ headerShown: false }} />
          <Stack.Screen name="rooms" options={{ title: 'Danh sách phòng' }} />
          <Stack.Screen name="room-form" options={{ title: 'Phòng' }} />
          <Stack.Screen name="bulk-rooms" options={{ title: 'Tạo nhiều phòng' }} />
          <Stack.Screen name="utility-rates" options={{ title: 'Điện nước' }} />
          <Stack.Screen name="surcharges" options={{ title: 'Phụ phí' }} />
          <Stack.Screen name="surcharge-form" options={{ title: 'Phụ phí' }} />
          <Stack.Screen name="change-password" options={{ title: 'Đổi mật khẩu' }} />
          <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
          <Stack.Screen name="room-detail" options={{ title: 'Chi tiết phòng' }} />
          <Stack.Screen name="meter-reading" options={{ title: 'Chỉ số điện nước' }} />
          <Stack.Screen name="invoice-preview" options={{ title: 'Hóa đơn dự kiến' }} />
          <Stack.Screen name="invoices" options={{ title: 'Hóa đơn' }} />
          <Stack.Screen name="invoice-detail" options={{ title: 'Chi tiết hóa đơn' }} />
          <Stack.Screen name="vietqr" options={{ title: 'VietQR' }} />
          <Stack.Screen name="leases" options={{ title: 'Hợp đồng' }} />
          <Stack.Screen name="lease-form" options={{ title: 'Tạo hợp đồng' }} />
          <Stack.Screen name="lease-detail" options={{ title: 'Chi tiết hợp đồng' }} />
          <Stack.Screen name="maintenance" options={{ title: 'Bảo trì' }} />
          <Stack.Screen name="maintenance-detail" options={{ title: 'Chi tiết bảo trì' }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ApiSessionProvider>
      <AppDataProvider>
        <AppNavigator />
      </AppDataProvider>
    </ApiSessionProvider>
  );
}
