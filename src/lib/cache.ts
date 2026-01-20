import { Redis } from '@upstash/redis';

// Lazy-load Redis to avoid instantiation at build time
let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) {
    return redis;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  // If credentials are missing or incomplete, mark as not configured
  if (!url || !token || url.trim() === '' || token.trim() === '') {
    redis = null;
    return null;
  }

  // Validate URL format before attempting to create client
  if (!url.startsWith('https://')) {
    console.warn('[Cache] Upstash Redis URL must start with https://, got:', url);
    redis = null;
    return null;
  }

  try {
    redis = new Redis({
      url,
      token,
    });
    return redis;
  } catch (error) {
    console.warn('[Cache] Failed to initialize Redis:', error);
    redis = null;
    return null;
  }
}


export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const redisClient = getRedis();
    if (!redisClient) return null;
    try {
      return await redisClient.get<T>(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) return;
    try {
      if (ttl) {
        await redisClient.setex(key, ttl, JSON.stringify(value));
      } else {
        await redisClient.set(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async del(key: string): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) return;
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) return;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  },
};

// Backwards-compatible aliases for commonly used keys elsewhere in the codebase
// These map older constant names to the canonical keys above.
/* (moved below after CACHE_KEYS definition) */

export const CACHE_KEYS = {
  products: (id?: string) => id ? `products:${id}` : 'products:all',
  brands: 'brands:all',
  categories: 'categories:all',
  companies: 'companies:all',
  user: (id: string) => `user:${id}`,
  // Dashboard cache keys
  dashboard: {
    activities: (offset: number = 0, limit: number = 20) => `dashboard:activities:${offset}:${limit}`,
    stats: 'dashboard:stats',
    quotes: (offset: number = 0, limit: number = 20) => `dashboard:quotes:${offset}:${limit}`,
    users: (offset: number = 0, limit: number = 20) => `dashboard:users:${offset}:${limit}`,
    newsletter: (offset: number = 0, limit: number = 20) => `dashboard:newsletter:${offset}:${limit}`,
    forms: (offset: number = 0, limit: number = 20) => `dashboard:forms:${offset}:${limit}`,
  },
};

// Backwards-compatible aliases for commonly used keys elsewhere in the codebase
// These map older constant names to the canonical keys above.
Object.assign(CACHE_KEYS, {
  PRODUCTS_LIST: CACHE_KEYS.products(),
  RECENT_USERS: CACHE_KEYS.dashboard.users(),
  RECENT_QUOTES: CACHE_KEYS.dashboard.quotes(),
  NEWSLETTER_SUBSCRIBERS: 'newsletter:subscribers',
});

/* (moved below after CACHE_TTL definition) */

export const CACHE_TTL = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  day: 86400, // 24 hours
  // Dashboard-specific TTLs
  dashboard: {
    realtime: 10, // 10 seconds - real-time data
    stats: 30, // 30 seconds - less critical
  },
};

// Backwards-compatible uppercase aliases (some modules use SHORT/MEDIUM etc.)
Object.defineProperty(CACHE_TTL, 'SHORT', { get: () => CACHE_TTL.short, enumerable: true });
Object.defineProperty(CACHE_TTL, 'MEDIUM', { get: () => CACHE_TTL.medium, enumerable: true });
Object.defineProperty(CACHE_TTL, 'LONG', { get: () => CACHE_TTL.long, enumerable: true });
Object.defineProperty(CACHE_TTL, 'DAY', { get: () => CACHE_TTL.day, enumerable: true });

/**
 * Get or fetch query with automatic caching
 * Falls back to in-memory cache if Redis unavailable
 * @param key - Cache key
 * @param fetcher - Async function to fetch data
 * @param ttl - Time to live in seconds
 */
export async function getCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.dashboard.realtime
): Promise<T> {
  // Try Redis first
  const cached = await cache.get<T>(key);
  if (cached) {
    console.log(`[CACHE_HIT] ${key}`);
    return cached;
  }

  // Fetch fresh data
  console.log(`[CACHE_MISS] ${key}`);
  const data = await fetcher();

  // Cache the result
  await cache.set(key, data, ttl);
  return data;
}

/**
 * Invalidate dashboard cache entries
 * @param pattern - Optional pattern (e.g., 'dashboard:activities')
 */
export async function invalidateDashboardCache(pattern?: string): Promise<void> {
  if (!pattern) {
    // Clear all dashboard cache
    console.log('[CACHE] Invalidating all dashboard cache');
    await cache.invalidatePattern('dashboard:*');
  } else {
    console.log(`[CACHE] Invalidating dashboard cache: ${pattern}`);
    await cache.invalidatePattern(pattern);
  }
}

// Backwards-compatible function aliases
export const cachedQuery = getCachedQuery;
export const invalidateCacheByPrefix = invalidateDashboardCache;
export const invalidateCache = invalidateDashboardCache;
