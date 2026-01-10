/**
 * Authentication Role Helper Utilities
 * 
 * Centralized utilities for handling role-based authentication flows,
 * including role validation, routing decisions, and user guidance.
 */

import { USER_ROLES, type UserRole } from '@/lib/auth-constants';

/**
 * Role Metadata - Provides UI/UX information for each role
 * Used in role selection, navigation, and permission displays
 */
export const ROLE_METADATA = {
  [USER_ROLES.ADMIN]: {
    label: 'Administrator',
    description: 'For BZION Hub internal management',
    subtitle: 'Manage the platform, monitor operations, and analyze metrics',
    icon: 'ShieldCheck',
    color: 'amber',
    loginPath: '/admin/login',
    dashboardPath: '/admin',
    targetAudience: 'BZION Hub staff',
    features: [
      'View dashboard & analytics',
      'Manage users & customers',
      'Process quotes & orders',
      'Monitor platform health',
    ],
  },
  [USER_ROLES.USER]: {
    label: 'Customer',
    description: 'For retailers, wholesalers & buyers',
    subtitle: 'Access products, manage quotes, and track orders',
    icon: 'Users',
    color: 'blue',
    loginPath: '/login',
    dashboardPath: '/account',
    targetAudience: 'Retailers, wholesalers, and end-users',
    features: [
      'Browse our extensive product catalog',
      'Request and manage quotes',
      'Track order status',
      'Manage your profile & addresses',
    ],
  },
} as const;

/**
 * Determine if a URL is associated with a specific role
 * @param path - The URL path to check
 * @param role - The role to validate against
 * @returns true if the path belongs to the given role
 */
export function isRolePath(path: string, role: UserRole): boolean {
  if (role === USER_ROLES.ADMIN) {
    return path.startsWith('/admin') && path !== '/admin/login';
  } else if (role === USER_ROLES.USER) {
    return path.startsWith('/account');
  }
  return false;
}

/**
 * Get all protected routes for a specific role
 * @param role - The role to get routes for
 * @returns Array of protected route patterns
 */
export function getRoleProtectedRoutes(role: UserRole): string[] {
  if (role === USER_ROLES.ADMIN) {
    return [
      '/admin',
      '/admin/users',
      '/admin/quotes',
      '/admin/products',
      '/admin/customers',
      '/admin/orders',
      '/admin/analytics',
    ];
  } else if (role === USER_ROLES.USER) {
    return [
      '/account',
      '/account/quotes',
      '/account/history',
      '/account/settings',
      '/checkout',
    ];
  }
  return [];
}

/**
 * Get role information by role value
 * @param role - The role to get info for
 * @returns Role metadata object
 */
export function getRoleInfo(role: UserRole) {
  return ROLE_METADATA[role] || null;
}

/**
 * Validate if a role is valid
 * @param role - The role to validate
 * @returns true if role is valid
 */
export function isValidRoleValue(role: unknown): role is UserRole {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.USER;
}

/**
 * Get the appropriate login path for a role
 * @param role - The role to get login path for
 * @returns The login URL path
 */
export function getLoginPathForRole(role: UserRole): string {
  const metadata = ROLE_METADATA[role];
  return metadata?.loginPath || '/login';
}

/**
 * Get the appropriate dashboard path for a role
 * @param role - The role to get dashboard path for
 * @returns The dashboard URL path
 */
export function getDashboardPathForRole(role: UserRole): string {
  const metadata = ROLE_METADATA[role];
  return metadata?.dashboardPath || '/account';
}

/**
 * Determine redirect path based on user role
 * Useful in auth callbacks and middleware
 * @param role - User's role from database/token
 * @param currentPath - Optional: current path for fallback logic
 * @returns Recommended redirect path
 */
export function getRedirectPathForRole(role: UserRole, currentPath?: string): string {
  const dashboardPath = getDashboardPathForRole(role);

  // If user is on a login page, redirect to dashboard
  if (currentPath === '/login' || currentPath === '/admin/login' || currentPath === '/auth/choose-role') {
    return dashboardPath;
  }

  // If user is on a page meant for another role, redirect to their dashboard
  if (currentPath && role === USER_ROLES.ADMIN && currentPath.startsWith('/account')) {
    return getDashboardPathForRole(USER_ROLES.ADMIN);
  }

  if (currentPath && role === USER_ROLES.USER && currentPath.startsWith('/admin')) {
    return getDashboardPathForRole(USER_ROLES.USER);
  }

  // Default: redirect to role's dashboard
  return dashboardPath;
}

/**
 * Check if user should be allowed to access a path
 * @param userRole - User's role
 * @param path - Path user is trying to access
 * @returns true if access is allowed
 */
export function canAccessPath(userRole: UserRole, path: string): boolean {
  if (userRole === USER_ROLES.ADMIN) {
    // Admin can access admin routes and public routes
    return path.startsWith('/admin') || isPublicPath(path);
  } else if (userRole === USER_ROLES.USER) {
    // Customer can access customer routes and public routes
    return path.startsWith('/account') || isPublicPath(path);
  }
  return false;
}

/**
 * Check if a path is publicly accessible
 * @param path - Path to check
 * @returns true if path is public
 */
export function isPublicPath(path: string): boolean {
  const publicPaths = [
    '/',
    '/products',
    '/about',
    '/contact',
    '/faq',
    '/careers',
    '/resources',
    '/companies',
    '/customers',
    '/login',
    '/register',
    '/auth/choose-role',
    '/auth/verify-request',
    '/auth/forgot-password',
  ];

  // Check exact matches
  if (publicPaths.includes(path)) {
    return true;
  }

  // Check prefix matches for dynamic routes
  if (path.startsWith('/products/')) {
    return true; // Product detail pages are public
  }

  if (path.startsWith('/resources/')) {
    return true; // Resource detail pages are public
  }

  return false;
}

/**
 * Format role for display
 * @param role - The role to format
 * @returns Human-readable role string
 */
export function formatRole(role: UserRole): string {
  const metadata = ROLE_METADATA[role];
  return metadata?.label || role;
}

/**
 * Get role error message for UI display
 * @param role - The role that had an error
 * @param errorType - Type of error ('mismatch' | 'unauthorized' | 'inactive')
 * @returns Error message to display to user
 */
export function getRoleErrorMessage(role: UserRole, errorType: string): string {
  const roleLabel = formatRole(role);

  switch (errorType) {
    case 'mismatch':
      return `Your account is registered as a ${roleLabel}. Please use the appropriate login interface.`;
    case 'unauthorized':
      return `You don't have permission to access this area. Please log in with the correct account type.`;
    case 'inactive':
      return `Your ${roleLabel} account is currently inactive. Please contact support.`;
    default:
      return `Unable to authenticate as ${roleLabel}. Please try again.`;
  }
}

/**
 * Log role-related events for audit trail
 * Useful for security monitoring and analytics
 * @param event - Event type ('role_selected' | 'role_mismatch' | 'unauthorized_access')
 * @param details - Additional details about the event
 */
export function logRoleEvent(event: string, details: Record<string, unknown>): void {
  if (typeof window !== 'undefined') {
    console.log(`[AUTH_ROLE] ${event}:`, {
      timestamp: new Date().toISOString(),
      ...details,
    });
  }
}
