import { api } from "./api";
import { getQueue, removeFromQueue, isOnline } from "./offline";

export async function syncPendingActions() {
  const online = await isOnline();
  if (!online) return;

  const queue = await getQueue();
  if (queue.length === 0) return;

  console.log(`Syncing ${queue.length} pending actions...`);

  for (const action of queue) {
    try {
      await api({
        method: action.method,
        url: action.url,
        data: action.body,
      });
      await removeFromQueue(action.id);
    } catch (err) {
      console.error(`Sync failed for ${action.method} ${action.url}:`, err);
      // Stop processing on failure to preserve order
      break;
    }
  }
}

export async function startPeriodicSync(intervalMs = 30000) {
  const interval = setInterval(syncPendingActions, intervalMs);
  return () => clearInterval(interval);
}
