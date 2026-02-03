/**
 * Authentication Role Utilities
 * 
 * Centralized utilities for handling role-based authentication flows,
 * including role validation, routing decisions, and user guidance.
 */

import { USER_ROLES, ROLE_METADATA, LOGIN_ROLE_CONFIG, REDIRECT_PATHS, type UserRole } from './constants';

/**
 * Check if a role is valid
 */
export function isValidRole(role: string | undefined): role is UserRole {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.USER;
}

/**
 * Type guard: Check if user is admin
 */
export function isAdmin(role: string | undefined): boolean {
  return role === USER_ROLES.ADMIN;
}

/**
 * Type guard: Check if user is regular user
 */
export function isUser(role: string | undefined): boolean {
  return role === USER_ROLES.USER;
}

/**
 * Get role display metadata
 * Used for UI rendering (labels, icons, colors)
 */
export function getRoleMetadata(role: UserRole) {
  return ROLE_METADATA[role];
}

/**
 * Get login configuration for specific role
 * Used during login flow
 */
export function getLoginConfig(role: UserRole) {
  return LOGIN_ROLE_CONFIG[role];
}

/**
 * Validate if email can be assigned admin role
 */
export function canBeAdmin(email: string): boolean {
  return email.toLowerCase().endsWith('@bzion.shop');
}

/**
 * Get admin email domain
 */
export function getAdminDomain(): string {
  return '@bzion.shop';
}

/**
 * Check if two roles are compatible
 * (e.g., can a user switch between roles)
 */
export function areRolesCompatible(roleA: UserRole, roleB: UserRole): boolean {
  // Each user can only have one role at a time
  // Switching roles requires re-authentication
  return roleA === roleB;
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.values(USER_ROLES);
}

/**
 * Get role label for display
 */
export function getRoleLabel(role: UserRole): string {
  return ROLE_METADATA[role].label;
}

/**
 * Get role description for display
 */
export function getRoleDescription(role: UserRole): string {
  return ROLE_METADATA[role].description;
}

/**
 * Get login path for role
 */
export function getLoginPath(role: UserRole): string {
  return ROLE_METADATA[role].loginPath;
}

/**
 * Get dashboard path for role
 */
export function getUserDashboardPath(role: string | undefined): string {
  return role === USER_ROLES.ADMIN
    ? REDIRECT_PATHS.ADMIN_DASHBOARD
    : REDIRECT_PATHS.USER_DASHBOARD;
}

/**
 * Check if role requires special handling (e.g., admin role)
 */
export function requiresSpecialAuth(role: UserRole): boolean {
  return role === USER_ROLES.ADMIN;
}

/**
 * Get features available to role
 */
export function getRoleFeatures(role: UserRole): string[] {
  return [...ROLE_METADATA[role].features];
}

/**
 * Check if user can perform action based on role
 */
export function canPerformAction(role: UserRole, action: string): boolean {
  const adminActions = [
    'manage_users',
    'manage_products',
    'view_analytics',
    'manage_quotes',
    'access_admin_dashboard',
  ];
  
  const customerActions = [
    'view_products',
    'request_quote',
    'view_orders',
    'manage_profile',
  ];
  
  if (role === USER_ROLES.ADMIN) {
    return adminActions.includes(action);
  }
  
  if (role === USER_ROLES.USER) {
    return customerActions.includes(action);
  }
  
  return false;
}

/**
 * Role comparison function
 * Useful for sorting or categorizing roles
 */
export function compareRoles(roleA: UserRole, roleB: UserRole): number {
  const order = [USER_ROLES.ADMIN, USER_ROLES.USER];
  return order.indexOf(roleA) - order.indexOf(roleB);
}

/**
 * Get all user-facing role information
 * Returns complete metadata for UI rendering
 */
export function getAllRoleMetadata() {
  return Object.fromEntries(
    getAllRoles().map(role => [role, getRoleMetadata(role)])
  );
}

/**
 * Get all login configurations
 * Used for login page role selection
 */
export function getAllLoginConfigs() {
  return Object.fromEntries(
    getAllRoles().map(role => [role, getLoginConfig(role)])
  );
}

/**
 * Determine if a URL is associated with a specific role
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
 * Check if user should be allowed to access a path
 */
export function canAccessPath(userRole: UserRole, path: string): boolean {
  if (userRole === USER_ROLES.ADMIN) {
    return path.startsWith('/admin') || isPublicPath(path);
  } else if (userRole === USER_ROLES.USER) {
    return path.startsWith('/account') || isPublicPath(path);
  }
  return false;
}

/**
 * Check if a path is publicly accessible
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

  if (publicPaths.includes(path)) {
    return true;
  }

  if (path.startsWith('/products/')) {
    return true;
  }

  if (path.startsWith('/resources/')) {
    return true;
  }

  return false;
}

/**
 * Format role for display
 */
export function formatRole(role: UserRole): string {
  return ROLE_METADATA[role]?.label || role;
}

/**
 * Get role error message for UI display
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
