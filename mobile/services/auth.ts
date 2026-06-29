import * as SecureStore from "expo-secure-store";
import api from "./api";
import { connectSocket, disconnectSocket } from "./socket";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** Login: call API, persist token + user in SecureStore, connect WebSocket */
export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: AuthUser }> {
  const res = await api.post("/auth/login", { email, password });
  // Response shape: { success: true, data: { token, user } }
  const { token, user } = res.data.data;

  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

  // Connect real-time socket after successful auth
  connectSocket(token);

  return { token, user };
}

/** Logout: notify server, clear local storage, disconnect socket */
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {}
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
  disconnectSocket();
}

/** Get stored JWT token */
export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Get stored user profile */
export async function getStoredUser(): Promise<AuthUser | null> {
  try {
    const json = await SecureStore.getItemAsync(USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

/** Clear all persisted auth data */
export async function clearAuth(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
  disconnectSocket();
}
