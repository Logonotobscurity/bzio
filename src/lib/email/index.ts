/**
 * Email Module - Public API
 * 
 * Centralized email functionality including SMTP transporter, templates,
 * validation, and schema definitions.
 */

// Re-export from original files (consolidation in progress)
export {
  testSMTPConnection,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendTestEmail,
} from '../email-service';
export {
  validateEmailFormat,
  checkDomainMX,
  sanitizeEmail,
  sanitizeContent,
  validateEmailRequest,
  checkEmailRateLimit,
  getEmailRateLimitStatus,
  clearEmailRateLimits,
  type EmailValidationResult,
} from '../email-validation';

// TODO: Once fully migrated, these will be consolidated into this module
// Future structure:
// - transporter.ts (SMTP configuration)
// - templates.ts (Email template system)
// - validation.ts (Email validation utilities)
// - schema.ts (Zod validation schemas)
// - send.ts (High-level email sending functions)
// - index.ts (Public API - this file)
