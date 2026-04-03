/**
 * Redis-based Rate Limiter
 * Production-ready rate limiting that works across distributed instances
 */

import { Redis } from 'ioredis';
import { env } from './env';

let redis: Redis | null = null;

// Initialize Redis connection
function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    console.warn('⚠️ REDIS_URL not configured. Rate limiting will use fallback in-memory store.');
    return null;
  }

  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  }

  return redis;
}

// In-memory fallback for development/when Redis is unavailable
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Clean up memory store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of memoryStore.entries()) {
    if (data.resetTime < now) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

interface RateLimitConfig {
  limit: number; // Number of requests
  window: number; // Time window in seconds
}

/**
 * Rate limit a request based on identifier (usually IP address)
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 100, window: 60 }
): Promise<{
  allowed: boolean;
  remaining: number;
  reset: number;
}> {
  const redisClient = getRedisClient();
  
  // Use Redis if available
  if (redisClient) {
    return rateLimitRedis(redisClient, identifier, config);
  }
  
  // Fallback to in-memory
  return rateLimitMemory(identifier, config);
}

/**
 * Redis-based rate limiting
 */
async function rateLimitRedis(
  client: Redis,
  identifier: string,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  remaining: number;
  reset: number;
}> {
  const key = `rate_limit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const resetTime = now + config.window;

  try {
    // Increment counter
    const count = await client.incr(key);

    // Set expiry on first request
    if (count === 1) {
      await client.expire(key, config.window);
    }

    const allowed = count <= config.limit;
    const remaining = Math.max(0, config.limit - count);

    return {
      allowed,
      remaining,
      reset: resetTime,
    };
  } catch (error) {
    console.error('Rate limit Redis error:', error);
    // Fallback to allowing request on Redis error
    return {
      allowed: true,
      remaining: config.limit,
      reset: resetTime,
    };
  }
}

/**
 * In-memory rate limiting (fallback)
 */
function rateLimitMemory(
  identifier: string,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const resetTime = now + config.window * 1000;

  const record = memoryStore.get(identifier);

  if (!record || record.resetTime < now) {
    // Create new record
    memoryStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      allowed: true,
      remaining: config.limit - 1,
      reset: Math.floor(resetTime / 1000),
    };
  }

  // Increment existing record
  record.count++;
  const allowed = record.count <= config.limit;
  const remaining = Math.max(0, config.limit - record.count);

  return {
    allowed,
    remaining,
    reset: Math.floor(record.resetTime / 1000),
  };
}

/**
 * Specific rate limiters for different endpoints
 */
export const rateLimiters = {
  // General API routes - 100 requests per minute
  api: (identifier: string) => rateLimit(identifier, { limit: 100, window: 60 }),

  // Authentication routes - 5 attempts per 15 minutes
  auth: (identifier: string) => rateLimit(identifier, { limit: 5, window: 900 }),

  // Password reset - 3 attempts per hour
  passwordReset: (identifier: string) => rateLimit(identifier, { limit: 3, window: 3600 }),

  // File uploads - 10 uploads per hour
  upload: (identifier: string) => rateLimit(identifier, { limit: 10, window: 3600 }),

  // Payment endpoints - 10 requests per 5 minutes
  payment: (identifier: string) => rateLimit(identifier, { limit: 10, window: 300 }),

  // Search endpoints - 30 requests per minute
  search: (identifier: string) => rateLimit(identifier, { limit: 30, window: 60 }),
};

/**
 * Cleanup function for graceful shutdown
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
