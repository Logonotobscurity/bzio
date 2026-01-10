/**
 * Client-Side Authentication Utilities
 * 
 * Provides safe, reusable functions for client-side authentication flows.
 * Uses next-auth/react hooks for session management and authentication.
 * 
 * These functions should only be used in Client Components (components with 'use client')
 * NOT for use in Server Components or API Routes (use server.ts instead)
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { USER_ROLES, REDIRECT_PATHS } from './constants';
import type { UserRole } from './constants';

/**
 * Custom hook: Get user's session status and data
 * Returns loading state for proper UI handling
 * 
 * Usage in Client Component:
 * ```tsx
 * export function MyComponent() {
 *   const { session, status } = useAuth();
 *   
 *   if (status === 'loading') return <Spinner />;
 *   if (!session) return <LoginPrompt />;
 *   
 *   return <div>Hello {session.user.email}</div>;
 * }
 * ```
 */
export function useAuth() {
  const sessionData = useSession();
  const session = sessionData.data;
  const status = sessionData.status;
  
  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
  };
}

/**
 * Custom hook: Check if user has specific role
 * Safe for conditional rendering
 * 
 * Usage:
 * ```tsx
 * const isAdmin = useIsRole('admin');
 * if (!isAdmin) return <AccessDenied />;
 * ```
 */
export function useIsRole(requiredRole: UserRole): boolean {
  const sessionData = useSession();
  const session = sessionData.data;
  return session?.user?.role === requiredRole;
}

/**
 * Custom hook: Check if user is admin
 * Shorthand for useIsRole('admin')
 */
export function useIsAdmin(): boolean {
  return useIsRole(USER_ROLES.ADMIN);
}

/**
 * Custom hook: Check if user is authenticated
 * Shorthand for checking session existence
 */
export function useIsAuthenticated(): boolean {
  const sessionData = useSession();
  const session = sessionData.data;
  return !!session;
}

/**
 * Custom hook: Protect client-side route
 * Redirects to login if not authenticated
 * 
 * Usage:
 * ```tsx
 * export function ProtectedComponent() {
 *   const { isAuthenticated } = useProtectRoute();
 *   if (!isAuthenticated) return null; // Will redirect
 *   return <ProtectedContent />;
 * }
 * ```
 */
export function useProtectRoute(requiredRole?: UserRole) {
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData.data;
  const status = sessionData.status;
  
  // If loading, don't redirect yet
  if (status === 'loading') {
    return {
      isAuthenticated: false,
      isLoading: true,
      isAuthorized: false,
    };
  }
  
  // If not authenticated, redirect to login
  if (!session) {
    router.push(REDIRECT_PATHS.LOGIN);
    return {
      isAuthenticated: false,
      isLoading: false,
      isAuthorized: false,
    };
  }
  
  // If role is required and user doesn't have it, redirect to unauthorized
  if (requiredRole && session.user?.role !== requiredRole) {
    router.push(REDIRECT_PATHS.UNAUTHORIZED);
    return {
      isAuthenticated: true,
      isLoading: false,
      isAuthorized: false,
    };
  }
  
  return {
    isAuthenticated: true,
    isLoading: false,
    isAuthorized: true,
  };
}

/**
 * Custom hook: Get current user's dashboard path
 * Useful for navigation after login
 */
export function useUserDashboard(): string {
  const sessionData = useSession();
  const session = sessionData.data;
  
  if (!session?.user?.role) {
    return REDIRECT_PATHS.LOGIN;
  }
  
  switch (session.user.role) {
    case USER_ROLES.ADMIN:
      return REDIRECT_PATHS.ADMIN_DASHBOARD;
    case USER_ROLES.USER:
      return REDIRECT_PATHS.USER_DASHBOARD;
    default:
      return REDIRECT_PATHS.LOGIN;
  }
}

/**
 * Custom hook: Handle role-based navigation
 * Returns function to navigate based on user's role
 */
export function useRoleBasedNavigation() {
  const router = useRouter();
  const sessionData = useSession();
  const session = sessionData.data;
  
  return useCallback(() => {
    if (!session?.user?.role) {
      router.push(REDIRECT_PATHS.LOGIN);
      return;
    }
    
    const dashboard = session.user.role === USER_ROLES.ADMIN 
      ? REDIRECT_PATHS.ADMIN_DASHBOARD 
      : REDIRECT_PATHS.USER_DASHBOARD;
    
    router.push(dashboard);
  }, [session, router]);
}

/**
 * Custom hook: Get user info with type safety
 * Returns user object with proper typing
 */
export function useUser() {
  const sessionData = useSession();
  const session = sessionData.data;
  
  return {
    user: session?.user || null,
    isAdmin: session?.user?.role === USER_ROLES.ADMIN,
    isCustomer: session?.user?.role === USER_ROLES.USER,
    email: session?.user?.email || null,
    role: session?.user?.role || null,
  };
}
