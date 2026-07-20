import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { apiRequest } from '@/lib/api';

// Foreground behavior: still show an alert/sound while the app is open, so
// a test push is visible even if you're staring at the push-test screen.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PushRegistrationStatus =
  | { state: 'idle' }
  | { state: 'registering' }
  | { state: 'registered'; expoPushToken: string }
  | { state: 'error'; message: string };

export function usePushNotifications(authToken: string | null) {
  const [status, setStatus] = useState<PushRegistrationStatus>({ state: 'idle' });
  const [lastNotification, setLastNotification] = useState<{
    title: string;
    body: string;
    receivedAt: string;
  } | null>(null);

  // Listen for incoming notifications regardless of registration state, so
  // the "last received" panel updates the moment one arrives.
  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      setLastNotification({
        title: notification.request.content.title ?? '',
        body: notification.request.content.body ?? '',
        receivedAt: new Date().toISOString(),
      });
    });
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      setLastNotification({
        title: response.notification.request.content.title ?? '',
        body: response.notification.request.content.body ?? '(tapped)',
        receivedAt: new Date().toISOString(),
      });
    });
    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  const registering = useRef(false);

  async function registerForPushNotifications() {
    if (registering.current) return;
    if (!authToken) {
      setStatus({ state: 'error', message: 'Log in first, then register for push.' });
      return;
    }
    if (Platform.OS === 'web') {
      setStatus({ state: 'error', message: 'Push notifications are mobile-only for this test screen.' });
      return;
    }
    if (!Device.isDevice) {
      setStatus({
        state: 'error',
        message: 'Push notifications require a physical device (not a simulator/emulator).',
      });
      return;
    }

    registering.current = true;
    setStatus({ state: 'registering' });
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status: requestedStatus } = await Notifications.requestPermissionsAsync();
        finalStatus = requestedStatus;
      }
      if (finalStatus !== 'granted') {
        setStatus({ state: 'error', message: 'Push notification permission was not granted.' });
        return;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId || projectId === 'REPLACE_WITH_YOUR_EAS_PROJECT_ID') {
        setStatus({
          state: 'error',
          message: 'Set expo.extra.eas.projectId in app.json to your EAS project id first.',
        });
        return;
      }

      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

      await apiRequest('/api/v1/notifications/device-tokens', {
        method: 'POST',
        token: authToken,
        body: { pushToken: expoPushToken, platform: Platform.OS === 'ios' ? 'ios' : 'android' },
      });

      setStatus({ state: 'registered', expoPushToken });
    } catch (err) {
      setStatus({
        state: 'error',
        message: err instanceof Error ? err.message : 'Failed to register for push notifications.',
      });
    } finally {
      registering.current = false;
    }
  }

  async function sendTestPush() {
    if (!authToken) throw new Error('Log in first.');
    await apiRequest('/api/v1/notifications/test', { method: 'POST', token: authToken });
  }

  return { status, lastNotification, registerForPushNotifications, sendTestPush };
}
