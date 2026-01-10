/**
 * Shared Login Utilities
 * Centralizes common login logic used by both customer and admin login flows
 * Reduces code duplication and ensures consistent behavior
 */

import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth-constants';

/**
 * Role metadata for login flows
 * Used to configure role-specific behavior, messaging, and styling
 */
export const LOGIN_ROLE_CONFIG = {
  [USER_ROLES.USER]: {
    role: USER_ROLES.USER,
    route: '/login',
    newRoute: '/auth/customer/login',
    adminRoute: '/admin/login',
    newAdminRoute: '/auth/admin/login',
    dashboardPath: REDIRECT_PATHS.USER_DASHBOARD,
    pageTitle: 'Customer Login',
    pageDescription: 'Sign in to your customer account',
    headerIcon: 'User',
    headerColor: 'text-blue-600 dark:text-blue-400',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    alertColor: 'text-blue-800 dark:text-blue-200',
    warningBanner: false,
    securityMessage: null as string | null,
    roleMismatchError: 'Your account has administrator privileges. Please use the administrator login interface to access the admin dashboard.',
    switchRoleText: 'Are you an administrator?',
    switchRoleLink: '/auth/admin/login',
    switchRoleLinkText: 'Login here',
  } as const,
  
  [USER_ROLES.ADMIN]: {
    role: USER_ROLES.ADMIN,
    route: '/admin/login',
    newRoute: '/auth/admin/login',
    customerRoute: '/login',
    newCustomerRoute: '/auth/customer/login',
    dashboardPath: REDIRECT_PATHS.ADMIN_DASHBOARD,
    pageTitle: 'Admin Login',
    pageDescription: 'Secure access for system administrators',
    headerIcon: 'Shield',
    headerColor: 'text-purple-600 dark:text-purple-400',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    alertColor: 'text-purple-800 dark:text-purple-200',
    warningBanner: true,
    securityMessage: 'This area is restricted to authorized administrators only. Unauthorized access attempts are monitored and logged.',
    roleMismatchError: 'Your account does not have administrator privileges. Please use the customer login interface.',
    switchRoleText: 'Not an administrator?',
    switchRoleLink: '/auth/customer/login',
    switchRoleLinkText: 'Login as customer',
    buttonText: 'Login as Administrator',
  } as const,
} as const;

/**
 * Determine which role config to use based on route
 * Recognizes both legacy (/admin/login, /login) and new (/auth/admin/login, /auth/customer/login) routes
 */
export function getRoleConfigByRoute(pathname: string) {
  if (pathname === '/admin/login' || pathname === '/auth/admin/login') {
    return LOGIN_ROLE_CONFIG[USER_ROLES.ADMIN];
  }
  return LOGIN_ROLE_CONFIG[USER_ROLES.USER];
}

/**
 * Validate role matches expected role for the login route
 * Used to detect role mismatches (e.g., admin trying to login as customer)
 * Recognizes both legacy (/admin/login, /login) and new (/auth/admin/login, /auth/customer/login) routes
 */
export function validateRoleForRoute(
  userRole: string,
  loginRoute: string
): { isValid: boolean; mismatchError?: string } {
  // Check for both old and new admin routes
  const isAdminRoute = 
    loginRoute === '/admin/login' || 
    loginRoute === '/auth/admin/login';
  const isAdminRole = userRole === USER_ROLES.ADMIN;

  if (isAdminRoute && !isAdminRole) {
    return {
      isValid: false,
      mismatchError: LOGIN_ROLE_CONFIG[USER_ROLES.ADMIN].roleMismatchError,
    };
  }

  if (!isAdminRoute && isAdminRole) {
    return {
      isValid: false,
      mismatchError: LOGIN_ROLE_CONFIG[USER_ROLES.USER].roleMismatchError,
    };
  }

  return { isValid: true };
}

/**
 * Get redirect path based on user role
 * Ensures role-based routing to correct dashboard
 */
export function getRedirectPathByRole(role: string): string {
  return role === USER_ROLES.ADMIN
    ? REDIRECT_PATHS.ADMIN_DASHBOARD
    : REDIRECT_PATHS.USER_DASHBOARD;
}

/**
 * Check if user is already authenticated and on wrong login page
 * Used to determine if user should be redirected
 * Recognizes both legacy (/admin/login, /login) and new (/auth/admin/login, /auth/customer/login) routes
 */
export function shouldRedirectAuthenticatedUser(
  userRole: string,
  currentRoute: string
): { shouldRedirect: boolean; redirectPath?: string } {
  const isAdminRole = userRole === USER_ROLES.ADMIN;
  // Check for both old and new admin routes
  const isAdminRoute = 
    currentRoute === '/admin/login' || 
    currentRoute === '/auth/admin/login';

  // Admin on customer login route -> redirect to admin dashboard
  if (isAdminRole && !isAdminRoute) {
    return {
      shouldRedirect: true,
      redirectPath: REDIRECT_PATHS.ADMIN_DASHBOARD,
    };
  }

  // Customer on admin login route -> redirect to customer dashboard
  if (!isAdminRole && isAdminRoute) {
    return {
      shouldRedirect: true,
      redirectPath: REDIRECT_PATHS.USER_DASHBOARD,
    };
  }

  return { shouldRedirect: false };
}

/**
 * Log authentication events with consistent format
 * Used for debugging and monitoring login flows
 */
export function logAuthEvent(
  eventType: string,
  details: Record<string, unknown>
) {
  const timestamp = new Date().toISOString();
  console.log(`[${eventType}]`, {
    ...details,
    timestamp,
  });
}

/**
 * Handle authentication errors and return user-friendly messages
 */
export function getAuthErrorMessage(error: string | null): string {
  const errorMap: Record<string, string> = {
    'CredentialsSignin': 'Invalid email or password. Please try again.',
    'AccessDenied': 'Access denied. Please check your credentials.',
    'OAuthSignin': 'OAuth configuration error. Please try again.',
    'OAuthCallback': 'OAuth callback error. Please try again.',
    'EmailSignInError': 'Failed to send email. Please try again.',
  };

  return error && errorMap[error]
    ? errorMap[error]
    : 'Something went wrong. Please try again.';
}

/**
 * Session verification helper
 * Fetch and parse session data with error handling
 */
export async function fetchAndVerifySession() {
  try {
    const response = await fetch('/api/auth/session');
    if (!response.ok) {
      throw new Error(`Session fetch failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[SESSION_FETCH] Error:', error);
    throw error;
  }
}

/**
 * Form validation helper
 * Validates email and password format
 */
export function validateLoginForm(email: string, password: string): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!email.includes('@')) {
    errors.email = 'Please enter a valid email';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
