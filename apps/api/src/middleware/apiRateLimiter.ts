// ─── API Rate Limiter Middleware ─────────────────────────────────────────────
// Per-IP rate limiting using the existing Redis token bucket from @shopsense/cache.
// Falls back to an in-memory sliding window when Redis is unavailable.

import { Request, Response, NextFunction } from 'express';
import { consumeToken } from '@shopsense/cache/src/rateLimiter';

// ─── In-Memory Fallback ──────────────────────────────────────────────────────
// Used when Redis is down. Simple sliding window counter per IP.

interface WindowEntry {
  count: number;
  resetAt: number;
}

const memoryWindows = new Map<string, WindowEntry>();

// Cleanup stale entries every 60s to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryWindows) {
    if (now > entry.resetAt) {
      memoryWindows.delete(key);
    }
  }
}, 60_000).unref();

function checkMemoryLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memoryWindows.get(key);

  if (!entry || now > entry.resetAt) {
    memoryWindows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count < maxRequests) {
    entry.count++;
    return true;
  }

  return false;
}

// ─── Middleware Factory ──────────────────────────────────────────────────────

interface RateLimitOptions {
  /** Max requests per window (default: 20) */
  maxRequests?: number;
  /** Window duration in ms (default: 60_000 = 1 minute) */
  windowMs?: number;
  /** Redis key prefix (default: 'api_rl') */
  keyPrefix?: string;
  /** Tokens per second for Redis token bucket (default: derived from maxRequests/windowMs) */
  tokensPerSecond?: number;
}

export function rateLimitMiddleware(options: RateLimitOptions = {}) {
  const {
    maxRequests = 20,
    windowMs = 60_000,
    keyPrefix = 'api_rl',
    tokensPerSecond = maxRequests / (windowMs / 1000),
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${ip}`;

    try {
      // Try Redis-backed token bucket first
      const allowed = await consumeToken(key, {
        maxTokens: maxRequests,
        refillRate: tokensPerSecond,
        keyPrefix,
      });

      if (!allowed) {
        res.status(429).json({
          success: false,
          error: 'Too many requests. Please slow down.',
          retryAfterMs: Math.ceil(1000 / tokensPerSecond),
        });
        return;
      }

      next();
    } catch {
      // Redis failed — fall back to in-memory
      const allowed = checkMemoryLimit(`${keyPrefix}:${key}`, maxRequests, windowMs);

      if (!allowed) {
        res.status(429).json({
          success: false,
          error: 'Too many requests. Please slow down.',
          retryAfterMs: windowMs,
        });
        return;
      }

      next();
    }
  };
}

// ─── Pre-configured limiters ─────────────────────────────────────────────────

/** Chat endpoint: 10 requests/minute per IP (each triggers 3-4 API calls) */
export const chatRateLimit = rateLimitMiddleware({
  maxRequests: 10,
  windowMs: 60_000,
  keyPrefix: 'rl_chat',
});

/** General API endpoints: 60 requests/minute per IP */
export const generalRateLimit = rateLimitMiddleware({
  maxRequests: 60,
  windowMs: 60_000,
  keyPrefix: 'rl_general',
});
