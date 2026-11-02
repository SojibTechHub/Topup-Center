import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "./env";

// ─── Redis Client ─────────────────────────────────────────────────────────────

let redisClient: Redis | null = null;
const isConfigured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

export function getRedis(): Redis | null {
  if (!isConfigured) return null;
  if (redisClient) return redisClient;

  redisClient = new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  });
  return redisClient;
}

// ─── Mock / Fallback Limiter ──────────────────────────────────────────────────

function createLimiter(sliding: any, prefix: string) {
  const client = getRedis();
  if (client) {
    return new Ratelimit({
      redis: client,
      limiter: sliding,
      prefix,
      analytics: true,
    });
  }

  // Graceful fallback when redis is not configured in local dev
  return {
    limit: async (_key?: string) => ({ success: true, remaining: 999, reset: 0 }),
  } as any;
}

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Login: 5 attempts per 15 minutes
export const loginRateLimit = createLimiter(Ratelimit.slidingWindow(5, "15 m"), "rl:login");

// Registration: 3 per hour per IP
export const registerRateLimit = createLimiter(Ratelimit.slidingWindow(3, "1 h"), "rl:register");

// Payment init: 10 per hour per user
export const paymentRateLimit = createLimiter(Ratelimit.slidingWindow(10, "1 h"), "rl:payment");

// AI chat: 20 per hour per user
export const aiRateLimit = createLimiter(Ratelimit.slidingWindow(20, "1 h"), "rl:ai");

// OTP: 5 per 10 minutes
export const otpRateLimit = createLimiter(Ratelimit.slidingWindow(5, "10 m"), "rl:otp");

// Order creation: 20 per hour per user
export const orderRateLimit = createLimiter(Ratelimit.slidingWindow(20, "1 h"), "rl:order");

// ─── Cache helpers ────────────────────────────────────────────────────────────

const inMemoryCache = new Map<string, { value: any; expiresAt: number }>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (redis) {
    try {
      return await redis.get<T>(key);
    } catch {
      return null;
    }
  }

  const item = inMemoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    inMemoryCache.delete(key);
    return null;
  }
  return item.value as T;
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
      return;
    } catch {
      // Cache failures are non-fatal
    }
  }

  inMemoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(key);
    } catch {}
  }
  inMemoryCache.delete(key);
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {}
  }
}

// ─── AI Key Cooldown ─────────────────────────────────────────────────────────

export async function setAiKeyCooldown(
  provider: string,
  keyIndex: number,
  ttlSeconds = 60
): Promise<void> {
  const key = `ai:cooldown:${provider}:${keyIndex}`;
  await cacheSet(key, 1, ttlSeconds);
}

export async function isAiKeyCoolingDown(
  provider: string,
  keyIndex: number
): Promise<boolean> {
  const key = `ai:cooldown:${provider}:${keyIndex}`;
  const val = await cacheGet(key);
  return val !== null;
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export async function blacklistToken(token: string, ttlSeconds: number) {
  await cacheSet(`blacklist:${token}`, 1, ttlSeconds);
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const val = await cacheGet(`blacklist:${token}`);
  return val !== null;
}
