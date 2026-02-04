/**
 * Re-export authentication constants from @/lib/auth/constants
 * This provides a simpler import path: @/lib/auth-constants
 * Single source of truth for all auth constants
 */

export {
  USER_ROLES,
  type UserRole,
  ADMIN_EMAILS,
  REDIRECT_PATHS,
  SESSION_CONFIG,
} from './auth/constants';
