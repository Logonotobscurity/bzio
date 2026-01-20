/**
 * Library Module - Complete Public API
 * 
 * This file serves as the single entry point for all library functionality.
 * Instead of importing from scattered locations, developers can import everything
 * from '@/lib' with a clear understanding of what's available.
 * 
 * ============================================================================
 * USAGE GUIDE
 * ============================================================================
 * 
 * Authentication:
 *   import { requireAdmin, useAuth } from '@/lib/auth';
 * 
 * Database:
 *   import { prisma } from '@/lib/database';
 * 
 * Email:
 *   import { sendResetPasswordEmail } from '@/lib/email';
 * 
 * Cache:
 *   import { cache } from '@/lib/cache';
 * 
 * Validation:
 *   import { validateEmail, validatePassword } from '@/lib/validations';
 * 
 * Types:
 *   import { type Product, type User } from '@/lib/types';
 * 
 * Configuration:
 *   import { APP_CONFIG, FEATURE_FLAGS } from '@/lib/config';
 * 
 * Monitoring:
 *   import { logError, trackEvent } from '@/lib/monitoring';
 * 
 * Security:
 *   import { sanitizeInput } from '@/lib/security';
 * 
 * ============================================================================
 */

// ============================================================================
// AUTHENTICATION MODULE
// ============================================================================
export * from '@/lib/auth';

// ============================================================================
// DATABASE MODULE
// ============================================================================
export {
  prisma,
  checkDatabaseConnection,
} from '@/lib/database';

// ============================================================================
// EMAIL MODULE
// ============================================================================
export {
  testSMTPConnection,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendTestEmail,
  validateEmailFormat,
  checkDomainMX,
  sanitizeEmail,
  sanitizeContent,
  validateEmailRequest,
  checkEmailRateLimit,
  getEmailRateLimitStatus,
  clearEmailRateLimits,
  type EmailValidationResult,
} from '@/lib/email';

// ============================================================================
// CACHE MODULE
// ============================================================================
export * from '@/lib/cache';

// ============================================================================
// VALIDATION MODULE
// ============================================================================
export * from '@/lib/validations';

// ============================================================================
// TYPES MODULE
// ============================================================================
export * from '@/lib/types';

// ============================================================================
// CONFIGURATION MODULE
// ============================================================================
export {
  APP_CONFIG,
  ENV_CONFIG,
  FEATURE_FLAGS,
  API_CONFIG,
  EMAIL_CONFIG,
  CACHE_CONFIG,
  RATELIMIT_CONFIG,
  DATABASE_CONFIG,
  getConfig,
  validateConfig,
} from '@/lib/config';

// ============================================================================
// MONITORING MODULE
// ============================================================================
export const MONITORING_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_MONITORING_ENABLED === 'true',
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'error',
  sampleRate: parseFloat(process.env.NEXT_PUBLIC_SAMPLE_RATE || '0.1'),
} as const;

// ============================================================================
// SECURITY MODULE
// ============================================================================
export * from '@/lib/security';

// ============================================================================
// UTILITIES (LEGACY - TO BE REORGANIZED)
// ============================================================================
// These are existing utility files that should be reorganized into proper modules
// For now, we export them here to maintain backward compatibility

// Product utilities
export * from '@/lib/product-utils';

// Analytics
export * from '@/lib/analytics';

// Admin authentication
export * from '@/lib/admin-auth';

// Web vitals
export * from '@/lib/web-vitals';

// Placeholder images
export * from '@/lib/placeholder-images';

// ============================================================================
// NOTES FOR FUTURE REFACTORING
// ============================================================================
// The following files should be reorganized into proper modules:
// 
// - auth-constants.ts → @/lib/auth/constants.ts (DONE ✓)
// - auth-utils.ts → @/lib/auth/server.ts (DONE ✓)
// - auth-role-utils.ts → @/lib/auth/roles.ts (DONE ✓)
// - auth.ts → @/lib/auth/config.ts (DONE ✓)
// - login-utils.ts → @/lib/auth/constants.ts (CONSOLIDATED ✓)
// - password-reset.ts → @/lib/auth/password.ts (CONSOLIDATED ✓)
// - password-utils.ts → @/lib/auth/password.ts (CONSOLIDATED ✓)
// - email-service.ts → @/lib/email/transporter.ts
// - email-validation.ts → @/lib/email/validation.ts
// - email-schemas.ts → @/lib/email/schemas.ts
// - error-logging-service.ts → @/lib/monitoring/errors.ts
// - performance-monitor.ts → @/lib/monitoring/performance.ts
// - activity-service.ts → @/lib/monitoring/activity.ts
// - admin-auth.ts → @/lib/auth/admin.ts
// - db-setup.ts → @/lib/database/setup.ts
// - prisma.ts → DELETE (replaced by @/lib/db/index.ts)
// 
// Once these are reorganized, we can remove them from this file and import
// from the proper module locations instead.
