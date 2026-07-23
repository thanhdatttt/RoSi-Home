import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

import { colors } from '@/ui';

function Icon({ value, color }: { value: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{value}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Trang chủ', tabBarIcon: ({ color }) => <Icon value="⌂" color={color} /> }}
      />
      <Tabs.Screen
        name="index"
        options={{ title: 'Bất động sản', tabBarIcon: ({ color }) => <Icon value="▦" color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Thiết lập', tabBarIcon: ({ color }) => <Icon value="☷" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Hồ sơ', tabBarIcon: ({ color }) => <Icon value="○" color={color} /> }}
      />
    </Tabs>
  );
}
