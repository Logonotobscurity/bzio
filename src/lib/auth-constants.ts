/**
 * Authentication Constants & Types
 * Single source of truth for role values and redirect paths
 * 
 * This file centralizes all authentication-related constants to prevent
 * hardcoded values scattered across the codebase and reduce bugs from
 * case sensitivity or path inconsistencies.
 */

/**
 * User role constants
 * Must match database values exactly
 * Database stores: 'customer' and 'admin' (LOWERCASE)
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'customer',
} as const;

// Type-safe role type derived from constants
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Application redirect paths
 * Centralized for consistency across middleware, components, and API routes
 */
export const REDIRECT_PATHS = {
  // Authenticated dashboard paths
  ADMIN_DASHBOARD: '/admin',
  USER_DASHBOARD: '/account',
  
  // Authentication pages
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Error pages
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
} as const;

/**
 * Determine user's correct dashboard path based on role
 * @param role - User's role from database/token
 * @returns Correct dashboard path for this user
 * 
 * @example
 * const path = getUserDashboardPath('ADMIN'); // Returns '/admin'
 * const path = getUserDashboardPath('USER');  // Returns '/account'
 * const path = getUserDashboardPath(undefined); // Returns '/account'
 */
export function getUserDashboardPath(role: string | undefined): string {
  return role === USER_ROLES.ADMIN 
    ? REDIRECT_PATHS.ADMIN_DASHBOARD 
    : REDIRECT_PATHS.USER_DASHBOARD;
}

/**
 * Type guard: Check if user is admin
 * @param role - User's role to check
 * @returns true if role is ADMIN
 * 
 * Usage ensures type safety when checking admin status:
 * if (isAdmin(session.user?.role)) {
 *   // Safe to access admin features
 * }
 */
export function isAdmin(role: string | undefined): boolean {
  return role === USER_ROLES.ADMIN;
}

/**
 * Type guard: Check if user is regular user
 * @param role - User's role to check
 * @returns true if role is USER
 */
export function isUser(role: string | undefined): boolean {
  return role === USER_ROLES.USER;
}

/**
 * Type guard: Check if role is valid
 * @param role - Role value to validate
 * @returns true if role is one of the defined USER_ROLES
 */
export function isValidRole(role: string | undefined): role is UserRole {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.USER;
}
