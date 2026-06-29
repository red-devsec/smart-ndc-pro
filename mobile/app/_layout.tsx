import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { getStoredUser, getToken } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import { registerForPushNotifications } from "../services/notifications";

export default function RootLayout() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setLoading = useAuthStore((s) => s.setLoading);

  // Restore auth session from SecureStore on app launch
  useEffect(() => {
    (async () => {
      try {
        const [token, storedUser] = await Promise.all([getToken(), getStoredUser()]);
        if (token && storedUser) {
          setToken(token);
          setUser(storedUser);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  // Register for push notifications when user is authenticated
  useEffect(() => {
    if (user?.id) {
      registerForPushNotifications(user.id);
    }
  }, [user?.id]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
