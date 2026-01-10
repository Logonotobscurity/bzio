/**
 * Authentication Module - Public API
 * 
 * This is the single entry point for all authentication functionality.
 * Import everything from here to ensure consistency and maintainability.
 * 
 * Usage:
 * ```tsx
 * // Server Component
 * import { requireAdmin } from '@/lib/auth';
 * 
 * // Client Component
 * import { useAuth, useIsAdmin } from '@/lib/auth';
 * 
 * // Type definitions
 * import { type UserRole } from '@/lib/auth';
 * ```
 */

// Constants and types
export {
  USER_ROLES,
  ADMIN_EMAILS,
  REDIRECT_PATHS,
  ROLE_METADATA,
  LOGIN_ROLE_CONFIG,
  SESSION_CONFIG,
  getUserDashboardPath,
  type UserRole,
} from './constants';

// Server-side utilities (use in Server Components, API Routes, Server Actions)
export {
  getSession,
  requireAuth,
  requireAdmin,
  requireUser,
  requireRole,
  isAdmin,
  isAuthenticated,
  getUserDashboard,
  verifyPermission,
} from './server';

// Client-side utilities (use only in Client Components with 'use client')
export {
  useAuth,
  useIsRole,
  useIsAdmin,
  useIsAuthenticated,
  useProtectRoute,
  useUserDashboard,
  useRoleBasedNavigation,
  useUser,
} from './client';

// Role utilities
export {
  isValidRole,
  getRoleMetadata,
  getLoginConfig,
  canBeAdmin,
  getAdminDomain,
  areRolesCompatible,
  getAllRoles,
  getRoleLabel,
  getRoleDescription,
  getLoginPath,
  getDashboardPath,
  requiresSpecialAuth,
  getRoleFeatures,
  canPerformAction,
  compareRoles,
  getAllRoleMetadata,
  getAllLoginConfigs,
} from './roles';

// Password utilities
export {
  PASSWORD_REQUIREMENTS,
  validatePassword,
  isPasswordValid,
  getPasswordStrengthLevel,
  getPasswordErrors,
  getPasswordWarnings,
  getPasswordRequirementsText,
  assessPasswordStrength,
  isStrongPassword,
  sanitizePasswordErrors,
  type PasswordValidationResult,
} from './password';

// NextAuth configuration and exports
export { handlers, signIn, signOut, auth } from './config';
