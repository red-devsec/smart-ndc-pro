import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const QUEUE_KEY = "offline-queue";
const CACHE_PREFIX = "cache-";

export interface QueuedAction {
  id: string;
  method: "POST" | "PUT" | "DELETE";
  url: string;
  body?: any;
  createdAt: number;
}

// ── Network status ──
export async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? true;
  } catch {
    return true;
  }
}

export function subscribeToNetwork(callback: (online: boolean) => void) {
  return NetInfo.addEventListener((state) => {
    callback(state.isConnected ?? true);
  });
}

// ── Offline queue ──
export async function addToQueue(action: Omit<QueuedAction, "id" | "createdAt">) {
  const queue = await getQueue();
  queue.push({ ...action, id: Date.now().toString(), createdAt: Date.now() });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getQueue(): Promise<QueuedAction[]> {
  try {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function removeFromQueue(id: string) {
  const queue = await getQueue();
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.filter((a) => a.id !== id)));
}

export async function clearQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

// ── Data cache ──
export async function cacheData<T>(key: string, data: T) {
  await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_PREFIX + key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function clearCache() {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
  await AsyncStorage.multiRemove(cacheKeys);
}
