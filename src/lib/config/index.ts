/**
 * Application Configuration Module - Public API
 * 
 * Centralized configuration for the entire application
 * Single source of truth for app-level settings
 */

import { env, APP_PUBLIC, FEATURE_FLAGS_PUBLIC, API_PUBLIC, CACHE_PUBLIC, RATELIMIT_PUBLIC, DATABASE_PUBLIC } from './env';

/**
 * Application metadata (sourced from validated `env` module)
 */
export const APP_CONFIG = APP_PUBLIC;

/**
 * Environment configuration
 */
export const ENV_CONFIG = {
  isDevelopment: env.isDevelopment,
  isProduction: env.isProduction,
  isTest: env.isTest,
  environment: env.nodeEnv,
} as const;

/**
 * Feature flags
 */
export const FEATURE_FLAGS = FEATURE_FLAGS_PUBLIC;

/**
 * API configuration
 */
export const API_CONFIG = API_PUBLIC;

/**
 * Email configuration
 */
export const EMAIL_CONFIG = {
  from: env.emailFrom || 'noreply@bzion.shop',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@bzion.shop',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@bzion.shop',
} as const;

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  defaultTTL: CACHE_PUBLIC.defaultTTL,
  redisTTL: CACHE_PUBLIC.redisTTL,
  maxSize: CACHE_PUBLIC.maxSize,
} as const;

/**
 * Rate limiting configuration
 */
export const RATELIMIT_CONFIG = {
  defaultLimit: RATELIMIT_PUBLIC.defaultLimit,
  windowMs: RATELIMIT_PUBLIC.windowMs,
  maxRequests: RATELIMIT_PUBLIC.maxRequests,
} as const;

/**
 * Database configuration
 */
export const DATABASE_CONFIG = {
  url: DATABASE_PUBLIC.url,
  poolMin: DATABASE_PUBLIC.poolMin,
  poolMax: DATABASE_PUBLIC.poolMax,
  connectionTimeout: DATABASE_PUBLIC.connectionTimeout,
  idleTimeout: DATABASE_PUBLIC.idleTimeout,
} as const;

/**
 * Configuration domains map
 */
const CONFIG = {
  app: APP_CONFIG,
  env: ENV_CONFIG,
  features: FEATURE_FLAGS,
  api: API_CONFIG,
  email: EMAIL_CONFIG,
  cache: CACHE_CONFIG,
  ratelimit: RATELIMIT_CONFIG,
  database: DATABASE_CONFIG,
} as const;

/**
 * Get configuration for specific domain
 * Usage: getConfig('email')
 */
export function getConfig<K extends keyof typeof CONFIG>(domain: K) {
  return CONFIG[domain];
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
