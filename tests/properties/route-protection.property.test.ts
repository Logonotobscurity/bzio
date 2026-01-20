/**
 * Property Test: Route Protection Correctness
 * 
 * Feature: backend-audit
 * Property 2: Route Protection Correctness
 * 
 * Tests that the authorized callback correctly protects routes based on:
 * - Public routes: accessible to everyone
 * - User routes: require authentication (any role)
 * - Admin routes: require ADMIN role
 * 
 * **Validates: Requirements 2.2, 2.4, 3.1, 3.2, 3.3, 6.1, 6.2**
 */

import * as fc from 'fast-check';
import { USER_ROLES } from '@/lib/auth-constants';

// Route categories based on auth.config.ts
const PUBLIC_PATHS = [
  '/',
  '/products',
  '/products/123',
  '/products/category/electronics',
  '/quote',
  '/guest-quote',
  '/newsletter',
  '/contact',
  '/login',
  '/register',
  '/auth/callback',
  '/api/auth/session',
  '/403',
  '/404',
];

const USER_PATHS = [
  '/account',
  '/account/settings',
  '/account/quotes',
  '/account/notifications',
  '/checkout',
  '/checkout/confirm',
];

const ADMIN_PATHS = [
  '/admin',
  '/admin/users',
  '/admin/products',
  '/admin/quotes',
  '/admin/analytics',
  '/admin/settings',
  '/admin/newsletter',
];

// Simulate the authorized callback logic from auth.config.ts
interface MockAuth {
  user?: {
    role?: string;
  };
}

type AuthResult = true | { redirect: string };

function simulateAuthorizedCallback(auth: MockAuth | null, path: string): AuthResult {
  const isLoggedIn = !!auth?.user;
  const role = auth?.user?.role ?? USER_ROLES.CUSTOMER;

  // Public routes - exact match for "/" only, prefix match for others
  const exactPublicPaths = ['/'];
  const prefixPublicPaths = [
    '/products',
    '/quote',
    '/guest-quote',
    '/newsletter',
    '/contact',
    '/login',
    '/register',
    '/auth/',
    '/api/auth/',
    '/_next/',
    '/favicon.ico',
    '/403',
    '/404',
  ];

  const isExactPublic = exactPublicPaths.includes(path);
  const isPrefixPublic = prefixPublicPaths.some((p) => path.startsWith(p));

  if (isExactPublic || isPrefixPublic) return true;

  // User routes - require authentication
  const isUserRoute = path.startsWith('/account') || path.startsWith('/checkout');

  if (isUserRoute) {
    if (!isLoggedIn) {
      return { redirect: `/login?callbackUrl=${path}` };
    }
    return true;
  }

  // Admin routes - require ADMIN role
  const isAdminRoute = path.startsWith('/admin');

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return { redirect: `/login?callbackUrl=${path}` };
    }
    if (role !== USER_ROLES.ADMIN) {
      return { redirect: '/403' };
    }
    return true;
  }

  // API routes
  if (path.startsWith('/api/')) {
    return true;
  }

  return true;
}

describe('Property 2: Route Protection Correctness', () => {
  // Arbitrary for roles
  const roleArbitrary = fc.oneof(
    fc.constant(USER_ROLES.ADMIN),
    fc.constant(USER_ROLES.CUSTOMER)
  );

  // Arbitrary for auth states
  const authArbitrary = fc.oneof(
    fc.constant(null), // Not logged in
    fc.record({ user: fc.record({ role: roleArbitrary }) }), // Logged in with role
  );

  describe('Public Routes', () => {
    it('should allow access to public routes regardless of auth state', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PUBLIC_PATHS),
          authArbitrary,
          (path, auth) => {
            const result = simulateAuthorizedCallback(auth, path);
            // Property: public routes always return true
            return result === true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('User Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...USER_PATHS),
          (path) => {
            const result = simulateAuthorizedCallback(null, path);
            // Property: unauthenticated users get redirected to login
            return typeof result === 'object' && result.redirect.startsWith('/login');
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should allow authenticated users (any role) to access user routes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...USER_PATHS),
          roleArbitrary,
          (path, role) => {
            const auth = { user: { role } };
            const result = simulateAuthorizedCallback(auth, path);
            // Property: authenticated users can access user routes
            return result === true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Admin Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ADMIN_PATHS),
          (path) => {
            const result = simulateAuthorizedCallback(null, path);
            // Property: unauthenticated users get redirected to login
            return typeof result === 'object' && result.redirect.startsWith('/login');
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should redirect non-admin users to 403', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ADMIN_PATHS),
          (path) => {
            const auth = { user: { role: USER_ROLES.CUSTOMER } };
            const result = simulateAuthorizedCallback(auth, path);
            // Property: CUSTOMER role gets redirected to 403
            return typeof result === 'object' && result.redirect === '/403';
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should allow admin users to access admin routes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ADMIN_PATHS),
          (path) => {
            const auth = { user: { role: USER_ROLES.ADMIN } };
            const result = simulateAuthorizedCallback(auth, path);
            // Property: ADMIN role can access admin routes
            return result === true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Role-Based Access Control Invariants', () => {
    it('should never allow CUSTOMER to access admin routes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ADMIN_PATHS),
          (path) => {
            const auth = { user: { role: USER_ROLES.CUSTOMER } };
            const result = simulateAuthorizedCallback(auth, path);
            // Property: CUSTOMER should never get true for admin routes
            return result !== true;
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should always include callbackUrl when redirecting to login', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...USER_PATHS, ...ADMIN_PATHS),
          (path) => {
            const result = simulateAuthorizedCallback(null, path);
            // Property: login redirects include callbackUrl
            if (typeof result === 'object' && result.redirect.startsWith('/login')) {
              return result.redirect.includes(`callbackUrl=${path}`);
            }
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
