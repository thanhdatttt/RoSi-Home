import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiRequest, Storage } from "@/lib/api";

export const PUSH_TOKEN_KEY = "rosihome.expoPushToken";

export type NotificationView = {
  id: string;
  type: string;
  title: string;
  body: string;
  linkRef: string | null;
  channel: "Push";
  deliveryStatus: "Pending" | "Sent" | "Failed";
  createdAt: string;
};

export function listNotifications(token: string | null) {
  return apiRequest<NotificationView[]>("/notifications", { token });
}

export async function enablePushNotifications(token: string | null) {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    throw new Error("Push notifications require an iOS or Android device.");
  }
  if (!Device.isDevice) throw new Error("Remote push notifications require a physical device.");
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "RosiHome notifications",
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.status === "granted" ? existing : await Notifications.requestPermissionsAsync();
  if (permission.status !== "granted") throw new Error("Notification permission was not granted.");
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error("Expo project ID is not configured.");
  const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await apiRequest("/notifications/device-tokens", {
    method: "POST",
    token,
    body: { pushToken, platform: Platform.OS },
  });
  await Storage.setItemAsync(PUSH_TOKEN_KEY, pushToken);
  return pushToken;
}

export async function disablePushNotifications(token: string | null) {
  const pushToken = await Storage.getItemAsync(PUSH_TOKEN_KEY);
  if (!pushToken) return;
  await apiRequest("/notifications/device-tokens", {
    method: "DELETE",
    token,
    body: { pushToken },
  });
  await Storage.deleteItemAsync(PUSH_TOKEN_KEY);
}
