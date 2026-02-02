/**
 * Authentication Constants
 * 
 * Centralized source of truth for all authentication-related constants,
 * including role definitions, redirect paths, email patterns, and
 * user guidance configuration.
 */

/**
 * User role constants
 * Must match database values exactly (LOWERCASE)
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'customer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Admin-specific email patterns
 * Enforces which email addresses can have admin role
 */
export const ADMIN_EMAILS = {
  ADMIN_DOMAIN_PATTERN: '@bzion.shop',
  PRIMARY_ADMIN: 'admin@bzion.shop',
  isAdminEmail: (email: string): boolean => {
    return email.toLowerCase().endsWith('@bzion.shop');
  },
} as const;

/**
 * Redirect paths for role-based navigation
 */
export const REDIRECT_PATHS = {
  // Authenticated dashboard paths
  USER_DASHBOARD: '/account',
  ADMIN_DASHBOARD: '/admin',

  // Authentication pages
  LOGIN: '/login',
  ADMIN_LOGIN: '/auth/admin/login',
  CUSTOMER_LOGIN: '/auth/customer/login',
  ROLE_SELECTION: '/auth/role-selection',
  VERIFY_REQUEST: '/auth/verify-request',
  REGISTER: '/register',

  // Error and feedback pages
  UNAUTHORIZED: '/unauthorized',
  AUTH_UNAUTHORIZED: '/auth/unauthorized',
  ERROR: '/auth/error',
  NOT_FOUND: '/404',
} as const;

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
    description: 'For businesses purchasing products',
    subtitle: 'Browse catalog, request quotes, manage orders',
    icon: 'Building2',
    color: 'blue',
    loginPath: '/login',
    dashboardPath: '/account',
    targetAudience: 'Business customers',
    features: [
      'Browse product catalog',
      'Request quotes',
      'Track orders',
      'Manage company info',
    ],
  },
} as const;

/**
 * Login role configuration
 * Centralizes login-specific metadata for both roles
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
  },
  [USER_ROLES.ADMIN]: {
    role: USER_ROLES.ADMIN,
    route: '/admin/login',
    newRoute: '/auth/admin/login',
    customerRoute: '/login',
    newCustomerRoute: '/auth/customer/login',
    dashboardPath: REDIRECT_PATHS.ADMIN_DASHBOARD,
    pageTitle: 'Administrator Login',
    pageDescription: 'Sign in to the admin dashboard',
    headerIcon: 'ShieldCheck',
    headerColor: 'text-amber-600 dark:text-amber-400',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    alertColor: 'text-amber-800 dark:text-amber-200',
    warningBanner: true,
    securityMessage: 'This is an administrator interface. Unauthorized access is prohibited.',
    roleMismatchError: 'Your account is a customer account. Please use the customer login to access your dashboard.',
    switchRoleText: 'Are you a customer?',
    switchRoleLink: '/auth/customer/login',
  },
} as const;

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  JWT_EXPIRES_IN: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  MAGIC_LINK_EXPIRES_IN: 10 * 60, // 10 minutes
} as const;
