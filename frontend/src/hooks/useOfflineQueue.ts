import { useCallback, useEffect, useState } from "react";

const QUEUE_KEY = "smart_ndc_offline_queue";

export interface QueuedAction {
  id: string;
  method: "POST" | "PUT" | "DELETE";
  url: string;
  body?: any;
  ts: number;
}

function readQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedAction[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

/**
 * Tracks navigator.onLine and provides an enqueue/flush mechanism for
 * failed API calls so they are retried once connectivity is restored.
 */
export function useOfflineQueue() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [queue, setQueue] = useState<QueuedAction[]>(() => readQueue());

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const enqueue = useCallback((action: Omit<QueuedAction, "id" | "ts">) => {
    const item: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
    };
    setQueue((prev) => {
      const next = [...prev, item];
      writeQueue(next);
      return next;
    });
  }, []);

  const flush = useCallback(async () => {
    if (!navigator.onLine) return;
    const current = readQueue();
    if (current.length === 0) return;
    const failed: QueuedAction[] = [];
    for (const item of current) {
      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: item.body ? { "Content-Type": "application/json" } : undefined,
          body: item.body ? JSON.stringify(item.body) : undefined,
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        failed.push(item);
      }
    }
    writeQueue(failed);
    setQueue(failed);
  }, []);

  useEffect(() => {
    if (online) flush();
  }, [online, flush]);

  return { online, queue, enqueue, flush };
}