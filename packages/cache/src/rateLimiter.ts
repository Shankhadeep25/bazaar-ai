// ─── Token Bucket Rate Limiter ───────────────────────────────────────────────
// Redis-backed rate limiter. Per-key (e.g., per associate tag).
// Falls back to allowing all requests if Redis is unavailable.

import { getRedisClient, isRedisConnected } from './index';

interface RateLimiterConfig {
  maxTokens: number;
  refillRate: number; // tokens per second
  keyPrefix: string;
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxTokens: 1,
  refillRate: 1, // 1 request per second (Amazon PA API limit)
  keyPrefix: 'ratelimit',
};

/**
 * Token bucket rate limiter backed by Redis.
 * Returns true if request is allowed, false if rate limited.
 */
export async function consumeToken(
  key: string,
  config: Partial<RateLimiterConfig> = {}
): Promise<boolean> {
  const { maxTokens, refillRate, keyPrefix } = { ...DEFAULT_CONFIG, ...config };
  const client = getRedisClient();

  // If Redis is down, allow all requests (graceful degradation)
  if (!client || !isRedisConnected()) return true;

  const bucketKey = `${keyPrefix}:${key}`;
  const now = Date.now();

  try {
    // Lua script for atomic token bucket operation
    const luaScript = `
      local bucket_key = KEYS[1]
      local max_tokens = tonumber(ARGV[1])
      local refill_rate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])

      local bucket = redis.call('HMGET', bucket_key, 'tokens', 'last_refill')
      local tokens = tonumber(bucket[1]) or max_tokens
      local last_refill = tonumber(bucket[2]) or now

      -- Refill tokens based on elapsed time
      local elapsed = (now - last_refill) / 1000
      tokens = math.min(max_tokens, tokens + (elapsed * refill_rate))

      if tokens >= 1 then
        tokens = tokens - 1
        redis.call('HMSET', bucket_key, 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', bucket_key, 60)
        return 1
      else
        redis.call('HMSET', bucket_key, 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', bucket_key, 60)
        return 0
      end
    `;

    const result = await client.eval(luaScript, 1, bucketKey, maxTokens, refillRate, now);
    return result === 1;
  } catch {
    // If Lua script fails, allow the request
    return true;
  }
}
