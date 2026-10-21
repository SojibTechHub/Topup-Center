import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "./env";

// ─── Redis Client ─────────────────────────────────────────────────────────────

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (redisClient) return redisClient;
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Upstash Redis credentials not configured");
  }
  redisClient = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  return redisClient;
}

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Login: 5 attempts per 15 minutes
export const loginRateLimit = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "rl:login",
  analytics: true,
});

// Registration: 3 per hour per IP
export const registerRateLimit = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "rl:register",
  analytics: true,
});

// Payment init: 10 per hour per user
export const paymentRateLimit = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  prefix: "rl:payment",
  analytics: true,
});

// AI chat: 20 per hour per user
export const aiRateLimit = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  prefix: "rl:ai",
  analytics: true,
});

// OTP: 5 per 10 minutes
export const otpRateLimit = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "rl:otp",
  analytics: true,
});

// Order creation: 20 per hour per user
export const orderRateLimit = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  prefix: "rl:order",
  analytics: true,
});

// ─── Cache helpers ────────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    return await redis.get<T>(key);
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // Cache failures are non-fatal
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch {}
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {}
}

// ─── AI Key Cooldown ─────────────────────────────────────────────────────────

export async function setAiKeyCooldown(
  provider: string,
  keyIndex: number,
  ttlSeconds = 60
): Promise<void> {
  const redis = getRedis();
  await redis.set(`ai:cooldown:${provider}:${keyIndex}`, 1, {
    ex: ttlSeconds,
  });
}

export async function isAiKeyCoolingDown(
  provider: string,
  keyIndex: number
): Promise<boolean> {
  try {
    const redis = getRedis();
    const val = await redis.get(`ai:cooldown:${provider}:${keyIndex}`);
    return val !== null;
  } catch {
    return false;
  }
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export async function blacklistToken(token: string, ttlSeconds: number) {
  const redis = getRedis();
  await redis.set(`blacklist:${token}`, 1, { ex: ttlSeconds });
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const redis = getRedis();
    const val = await redis.get(`blacklist:${token}`);
    return val !== null;
  } catch {
    return false;
  }
}
