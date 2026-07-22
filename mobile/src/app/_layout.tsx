import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MockDataProvider } from '@/features/mock-data';
import { colors } from '@/ui/theme';

export default function RootLayout() {
  return <MockDataProvider><StatusBar style="dark"/><Stack screenOptions={{ headerStyle:{backgroundColor:colors.surface}, headerTintColor:colors.text, headerShadowVisible:false, contentStyle:{backgroundColor:colors.background}, headerBackTitle:'Quay lại' }}><Stack.Screen name="index" options={{headerShown:false}}/><Stack.Screen name="(auth)" options={{headerShown:false}}/><Stack.Screen name="(tabs)" options={{headerShown:false}}/><Stack.Screen name="property-form" options={{title:'Bất động sản'}}/><Stack.Screen name="property-detail" options={{headerShown:false}}/><Stack.Screen name="rooms" options={{title:'Danh sách phòng'}}/><Stack.Screen name="room-form" options={{title:'Phòng'}}/><Stack.Screen name="bulk-rooms" options={{title:'Tạo nhiều phòng'}}/><Stack.Screen name="utility-rates" options={{title:'Điện nước'}}/><Stack.Screen name="surcharges" options={{title:'Phụ phí'}}/><Stack.Screen name="surcharge-form" options={{title:'Phụ phí'}}/><Stack.Screen name="change-password" options={{title:'Đổi mật khẩu'}}/></Stack></MockDataProvider>;
}
