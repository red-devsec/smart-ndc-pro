import { Platform } from "react-native";
import api from "./api";

let expoNotifications: any = null;

async function loadExpoModule() {
  try {
    expoNotifications = await import("expo-notifications");
    expoNotifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    console.warn("expo-notifications not available");
  }
}

export async function registerForPushNotifications(userId: string) {
  await loadExpoModule();
  if (!expoNotifications) return;

  const { getPermissionsAsync, requestPermissionsAsync, getExpoPushTokenAsync } = expoNotifications;

  let { status: existingStatus } = await getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission not granted");
    return;
  }

  try {
    const tokenData = await getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    await api.post("/auth/push-token", { token: pushToken });
    console.log("Push token registered:", pushToken);
  } catch (err) {
    console.error("Failed to register push token:", err);
  }
}

export function getLastNotificationResponse() {
  if (!expoNotifications) return null;
  return expoNotifications.getLastNotificationResponseAsync();
}
