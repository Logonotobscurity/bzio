/**
 * Environment Configuration Module
 * 
 * Validates and provides type-safe access to all environment variables.
 * Fails fast at startup with descriptive errors for missing/invalid values.
 * 
 * IMPORTANT: This is the ONLY place where process.env should be accessed directly.
 * All other code should import from this module.
 */

import { type DataMode } from './mode';

/**
 * Environment configuration interface
 * Provides type-safe access to all environment variables
 */
export interface EnvConfig {
  // Node Environment
  nodeEnv: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // Authentication (NextAuth)
  nextAuthUrl: string;
  nextAuthSecret: string;
  authUrl: string;

  // Database (Prisma + PostgreSQL)
  databaseUrl: string;

  // Email Service (Resend SMTP)
  emailServerHost: string;
  emailServerPort: number;
  emailServerUser: string;
  emailServerPassword: string;
  emailFrom: string;

  // Caching & Rate Limiting (Upstash Redis)
  upstashRedisUrl: string;
  upstashRedisToken: string;

  // WhatsApp Integration
  whatsappBusinessPhone: string;
  whatsappBusinessUrl: string;

  // Monitoring & Version
  appVersion: string;

  // Feature Flags
  dataSource: 'static' | 'dynamic' | 'hybrid';
  dataMode: DataMode;
  useDatabase: boolean;

  // Admin Setup
  adminSetupToken?: string;
}

/**
 * Validate and parse a required environment variable
 * @throws Error if variable is missing or empty
 */
function requireEnv(name: string, description?: string): string {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    const desc = description ? ` (${description})` : '';
    throw new Error(
      `Missing required environment variable: ${name}${desc}\n` +
      `Please set this variable in your .env.local file or environment configuration.\n` +
      `See .env.example for details.`
    );
  }

  return value.trim();
}

/**
 * Get an optional environment variable with a default value
 */
function getEnv(name: string, defaultValue: string): string {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : defaultValue;
}

/**
 * Parse and validate an integer environment variable
 * @throws Error if value is not a valid integer
 */
function requireEnvInt(name: string, description?: string): number {
  const value = requireEnv(name, description);
  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    throw new Error(
      `Invalid value for ${name}: "${value}". Expected an integer.`
    );
  }

  return parsed;
}

/**
 * Validate NODE_ENV value
 */
function validateNodeEnv(): 'development' | 'production' | 'test' {
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (nodeEnv !== 'development' && nodeEnv !== 'production' && nodeEnv !== 'test') {
    throw new Error(
      `Invalid NODE_ENV: "${nodeEnv}". Must be "development", "production", or "test".`
    );
  }

  return nodeEnv;
}

/**
 * Validate DATA_MODE value
 */
function validateDataMode(): DataMode {
  const dataMode = process.env.DATA_MODE || process.env.NEXT_PUBLIC_DATA_MODE || 'dynamic';

  if (dataMode !== 'dynamic' && dataMode !== 'static') {
    throw new Error(
      `Invalid DATA_MODE: "${dataMode}". Must be "dynamic" or "static".`
    );
  }

  return dataMode as DataMode;
}

/**
 * Validate DATA_SOURCE value
 */
function validateDataSource(): 'static' | 'dynamic' | 'hybrid' {
  const dataSource = process.env.DATA_SOURCE || 'static';

  if (dataSource !== 'static' && dataSource !== 'dynamic' && dataSource !== 'hybrid') {
    throw new Error(
      `Invalid DATA_SOURCE: "${dataSource}". Must be "static", "dynamic", or "hybrid".`
    );
  }

  return dataSource as 'static' | 'dynamic' | 'hybrid';
}

/**
 * Validate email format
 */
function validateEmail(email: string, varName: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new Error(
      `Invalid email format for ${varName}: "${email}"`
    );
  }

  return email;
}

/**
 * Validate URL format
 */
function validateUrl(url: string, varName: string): string {
  try {
    new URL(url);
    return url;
  } catch {
    throw new Error(
      `Invalid URL format for ${varName}: "${url}"`
    );
  }
}

/**
 * Initialize and validate environment configuration
 * This runs once when the module is imported
 */
function initializeEnv(): EnvConfig {
  try {
    // Validate NODE_ENV
    const nodeEnv = validateNodeEnv();

    // Validate DATA_MODE
    const dataMode = validateDataMode();

    // Validate DATA_SOURCE
    const dataSource = validateDataSource();

    // In development, some variables can be optional or have defaults
    const isDev = nodeEnv === 'development';

    // Authentication - always required
    const nextAuthUrl = validateUrl(
      requireEnv('NEXTAUTH_URL', 'NextAuth base URL'),
      'NEXTAUTH_URL'
    );
    const nextAuthSecret = requireEnv('NEXTAUTH_SECRET', 'NextAuth JWT secret');
    const authUrl = validateUrl(
      getEnv('AUTH_URL', nextAuthUrl),
      'AUTH_URL'
    );

    // Database - required in dynamic mode
    let databaseUrl: string;
    if (dataMode === 'dynamic') {
      databaseUrl = requireEnv('DATABASE_URL', 'PostgreSQL connection string');
    } else {
      databaseUrl = getEnv('DATABASE_URL', '');
    }

    // Email - required for production, optional for development
    const emailServerHost = isDev 
      ? getEnv('EMAIL_SERVER_HOST', 'smtp.resend.com')
      : requireEnv('EMAIL_SERVER_HOST', 'SMTP server host');
    
    const emailServerPort = isDev
      ? parseInt(getEnv('EMAIL_SERVER_PORT', '587'), 10)
      : requireEnvInt('EMAIL_SERVER_PORT', 'SMTP server port');
    
    const emailServerUser = isDev
      ? getEnv('EMAIL_SERVER_USER', 'resend')
      : requireEnv('EMAIL_SERVER_USER', 'SMTP username');
    
    const emailServerPassword = isDev
      ? getEnv('EMAIL_SERVER_PASSWORD', '')
      : requireEnv('EMAIL_SERVER_PASSWORD', 'SMTP password');
    
    const emailFrom = validateEmail(
      isDev 
        ? getEnv('EMAIL_FROM', 'noreply@example.com')
        : requireEnv('EMAIL_FROM', 'From email address'),
      'EMAIL_FROM'
    );

    // Redis - required for production, optional for development
    const upstashRedisUrl = isDev
      ? getEnv('UPSTASH_REDIS_REST_URL', '')
      : validateUrl(requireEnv('UPSTASH_REDIS_REST_URL', 'Upstash Redis URL'), 'UPSTASH_REDIS_REST_URL');
    
    const upstashRedisToken = isDev
      ? getEnv('UPSTASH_REDIS_REST_TOKEN', '')
      : requireEnv('UPSTASH_REDIS_REST_TOKEN', 'Upstash Redis token');

    // WhatsApp - optional
    const whatsappBusinessPhone = getEnv('NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE', '+2347010326015');
    const whatsappBusinessUrl = getEnv('NEXT_WHATSAPP_BUSINESS_URL', 'https://wa.me/message/YOUR_MESSAGE_ID');

    // Monitoring
    const appVersion = getEnv('NEXT_PUBLIC_APP_VERSION', '1.0.0');

    // Feature flags
    const useDatabase = getEnv('USE_DATABASE', 'true') === 'true';

    // Admin setup token (optional)
    const adminSetupToken = process.env.ADMIN_SETUP_TOKEN;

    return {
      // Node Environment
      nodeEnv,
      isDevelopment: nodeEnv === 'development',
      isProduction: nodeEnv === 'production',
      isTest: nodeEnv === 'test',

      // Authentication
      nextAuthUrl,
      nextAuthSecret,
      authUrl,

      // Database
      databaseUrl,

      // Email
      emailServerHost,
      emailServerPort,
      emailServerUser,
      emailServerPassword,
      emailFrom,

      // Redis
      upstashRedisUrl,
      upstashRedisToken,

      // WhatsApp
      whatsappBusinessPhone,
      whatsappBusinessUrl,

      // Monitoring
      appVersion,

      // Feature Flags
      dataSource,
      dataMode,
      useDatabase,

      // Admin
      adminSetupToken,
    };
  } catch (error) {
    // Re-throw with additional context
    if (error instanceof Error) {
      console.error('\n❌ Environment Configuration Error:\n');
      console.error(error.message);
      console.error('\nPlease check your .env.local file or environment configuration.');
      console.error('See .env.example for a complete list of required variables.\n');
    }
    throw error;
  }
}

/**
 * Validated environment configuration
 * This is initialized once when the module is imported
 */
export const env: EnvConfig = initializeEnv();

/**
 * Public-facing application metadata and feature flags.
 * Exported here so this module is the single source of truth for env vars.
 */
export const APP_PUBLIC = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'BZION B2B Platform',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://bzion.shop',
  version: process.env.NEXT_PUBLIC_APP_VERSION || env.appVersion || '1.0.0',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'BZION B2B E-Commerce Platform',
} as const;

export const FEATURE_FLAGS_PUBLIC = {
  ENABLE_EMAIL_AUTH: (process.env.NEXT_PUBLIC_ENABLE_EMAIL_AUTH || 'true') !== 'false',
  ENABLE_CREDENTIALS_AUTH: (process.env.NEXT_PUBLIC_ENABLE_CREDENTIALS_AUTH || 'true') !== 'false',
  ENABLE_MAGIC_LINKS: (process.env.NEXT_PUBLIC_ENABLE_MAGIC_LINKS || 'true') !== 'false',
  ENABLE_QUOTE_REQUESTS: (process.env.NEXT_PUBLIC_ENABLE_QUOTE_REQUESTS || 'true') !== 'false',
  ENABLE_SEARCH: (process.env.NEXT_PUBLIC_ENABLE_SEARCH || 'true') !== 'false',
  ENABLE_FILTERING: (process.env.NEXT_PUBLIC_ENABLE_FILTERING || 'true') !== 'false',
  ENABLE_ADMIN_DASHBOARD: (process.env.NEXT_PUBLIC_ENABLE_ADMIN_DASHBOARD || 'true') !== 'false',
  ENABLE_ANALYTICS: (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || 'true') !== 'false',
  ENABLE_CRM_SYNC: (process.env.NEXT_PUBLIC_ENABLE_CRM_SYNC || 'true') !== 'false',
} as const;

export const API_PUBLIC = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || APP_PUBLIC.url,
  timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
  retries: parseInt(process.env.API_RETRIES || '3', 10),
} as const;

export const CACHE_PUBLIC = {
  defaultTTL: parseInt(process.env.CACHE_TTL || '300', 10),
  redisTTL: parseInt(process.env.REDIS_TTL || '3600', 10),
  maxSize: parseInt(process.env.CACHE_MAX_SIZE || '100', 10),
} as const;

export const RATELIMIT_PUBLIC = {
  defaultLimit: parseInt(process.env.RATELIMIT_DEFAULT || '100', 10),
  windowMs: parseInt(process.env.RATELIMIT_WINDOW || '60000', 10),
  maxRequests: parseInt(process.env.RATELIMIT_MAX_REQUESTS || '100', 10),
} as const;

export const DATABASE_PUBLIC = {
  url: process.env.DATABASE_URL || env.databaseUrl,
  poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
  poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
  connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '5000', 10),
  idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000', 10),
} as const;

/**
 * Helper function to check if a required service is configured
 */
export function isServiceConfigured(service: 'email' | 'redis' | 'database'): boolean {
  switch (service) {
    case 'email':
      return !!(env.emailServerPassword && env.emailServerHost);
    case 'redis':
      return !!(env.upstashRedisUrl && env.upstashRedisToken);
    case 'database':
      return !!env.databaseUrl;
    default:
      return false;
  }
}

/**
 * Get a summary of the current environment configuration
 * (Safe for logging - excludes sensitive values)
 */
export function getEnvSummary(): Record<string, string | boolean> {
  return {
    nodeEnv: env.nodeEnv,
    dataMode: env.dataMode,
    dataSource: env.dataSource,
    emailConfigured: isServiceConfigured('email'),
    redisConfigured: isServiceConfigured('redis'),
    databaseConfigured: isServiceConfigured('database'),
    appVersion: env.appVersion,
  };
}
