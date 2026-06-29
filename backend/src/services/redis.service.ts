import { createClient, RedisClientType } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({ url: REDIS_URL });
    client.on("error", (err) => console.error("Redis error:", err));
    await client.connect();
  }
  return client;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  const c = await getRedisClient();
  await c.setEx(key, ttlSeconds, JSON.stringify(value));
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const c = await getRedisClient();
  const data = await c.get(key);
  return data ? (JSON.parse(data) as T) : null;
}

export async function cacheDel(key: string): Promise<void> {
  const c = await getRedisClient();
  await c.del(key);
}

export async function cacheClear(pattern: string): Promise<void> {
  const c = await getRedisClient();
  const keys = await c.keys(pattern);
  if (keys.length > 0) {
    await c.del(keys);
  }
}
