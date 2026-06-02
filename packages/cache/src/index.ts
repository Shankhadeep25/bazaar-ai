// ─── Redis Cache Wrapper ─────────────────────────────────────────────────────
// Graceful fallback: if Redis is unavailable, logs warning and returns null.

import Redis from 'ioredis';

let redisClient: Redis | null = null;
let isConnected = false;

export function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) {
          console.warn('[Redis] Max retries reached. Operating without cache.');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      isConnected = true;
      console.log('[Redis] Connected successfully');
    });

    redisClient.on('error', (err: Error) => {
      isConnected = false;
      console.warn('[Redis] Connection error:', err.message);
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    return redisClient;
  } catch (err) {
    console.warn('[Redis] Failed to create client:', err);
    return null;
  }
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  if (client) {
    try {
      await client.connect();
    } catch {
      console.warn('[Redis] Connect failed. Continuing without cache.');
    }
  }
}

export function isRedisConnected(): boolean {
  return isConnected;
}

// ─── Basic Operations ────────────────────────────────────────────────────────

export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedisClient();
  if (!client || !isConnected) return null;
  try {
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  const client = getRedisClient();
  if (!client || !isConnected) return;
  try {
    await client.setex(key, ttlSeconds, value);
  } catch {
    // Silently fail — cache is best-effort
  }
}

export async function cacheDel(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client || !isConnected) return;
  try {
    await client.del(key);
  } catch {
    // Silently fail
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
  }
}

export * from './embeddingCache';
export * from './rateLimiter';
