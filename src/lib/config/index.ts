/**
 * Application Configuration Module - Public API
 * 
 * Centralized configuration for the entire application
 * Single source of truth for app-level settings
 */

/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'BZION B2B Platform',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://bzion.shop',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  description: 'BZION B2B E-Commerce Platform',
} as const;

/**
 * Environment configuration
 */
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  environment: process.env.NODE_ENV as 'development' | 'production' | 'test',
} as const;

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  // Authentication features
  ENABLE_EMAIL_AUTH: process.env.NEXT_PUBLIC_ENABLE_EMAIL_AUTH !== 'false',
  ENABLE_CREDENTIALS_AUTH: process.env.NEXT_PUBLIC_ENABLE_CREDENTIALS_AUTH !== 'false',
  ENABLE_MAGIC_LINKS: process.env.NEXT_PUBLIC_ENABLE_MAGIC_LINKS !== 'false',
  
  // Product features
  ENABLE_QUOTE_REQUESTS: process.env.NEXT_PUBLIC_ENABLE_QUOTE_REQUESTS !== 'false',
  ENABLE_SEARCH: process.env.NEXT_PUBLIC_ENABLE_SEARCH !== 'false',
  ENABLE_FILTERING: process.env.NEXT_PUBLIC_ENABLE_FILTERING !== 'false',
  
  // Admin features
  ENABLE_ADMIN_DASHBOARD: process.env.NEXT_PUBLIC_ENABLE_ADMIN_DASHBOARD !== 'false',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
  ENABLE_CRM_SYNC: process.env.NEXT_PUBLIC_ENABLE_CRM_SYNC !== 'false',
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL,
  timeout: parseInt(process.env.API_TIMEOUT || '30000'),
  retries: parseInt(process.env.API_RETRIES || '3'),
} as const;

/**
 * Email configuration
 */
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@bzion.shop',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@bzion.shop',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@bzion.shop',
} as const;

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  defaultTTL: parseInt(process.env.CACHE_TTL || '300'), // 5 minutes
  redisTTL: parseInt(process.env.REDIS_TTL || '3600'), // 1 hour
  maxSize: parseInt(process.env.CACHE_MAX_SIZE || '100'),
} as const;

/**
 * Rate limiting configuration
 */
export const RATELIMIT_CONFIG = {
  defaultLimit: parseInt(process.env.RATELIMIT_DEFAULT || '100'),
  windowMs: parseInt(process.env.RATELIMIT_WINDOW || '60000'), // 1 minute
  maxRequests: parseInt(process.env.RATELIMIT_MAX_REQUESTS || '100'),
} as const;

/**
 * Database configuration
 */
export const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL,
  poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '5000'),
  idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
} as const;

/**
 * Get configuration for specific domain
 * Usage: getConfig('email')
 */
type ConfigDomain = {
  app: typeof APP_CONFIG;
  env: typeof ENV_CONFIG;
  features: typeof FEATURE_FLAGS;
  api: typeof API_CONFIG;
  email: typeof EMAIL_CONFIG;
  cache: typeof CACHE_CONFIG;
  ratelimit: typeof RATELIMIT_CONFIG;
  database: typeof DATABASE_CONFIG;
};

export function getConfig<K extends keyof ConfigDomain>(domain: K): ConfigDomain[K] {
  const config: ConfigDomain = {
    app: APP_CONFIG,
    env: ENV_CONFIG,
    features: FEATURE_FLAGS,
    api: API_CONFIG,
    email: EMAIL_CONFIG,
    cache: CACHE_CONFIG,
    ratelimit: RATELIMIT_CONFIG,
    database: DATABASE_CONFIG,
  };
  
  return config[domain];
}

/**
 * Validate that all required environment variables are set
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is not set');
  }
  
  if (!process.env.NEXTAUTH_SECRET) {
    errors.push('NEXTAUTH_SECRET is not set');
  }
  
  if (!process.env.NEXTAUTH_URL) {
    errors.push('NEXTAUTH_URL is not set');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate on module load in development
if (ENV_CONFIG.isDevelopment) {
  const validation = validateConfig();
  if (!validation.valid) {
    console.warn('⚠️ Configuration validation warnings:');
    validation.errors.forEach(error => console.warn(`  - ${error}`));
  }
}
