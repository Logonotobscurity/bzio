/**
 * Server-Side Authentication Utilities
 * 
 * Provides safe, reusable functions for protecting server components and API routes.
 * These functions should be used in:
 * - Server Components (async functions)
 * - API Routes (GET/POST handlers)
 * - Server Actions
 * 
 * NOT for use in Client Components (use next-auth/react hooks instead)
 */

import { auth } from "@/lib/auth";
import { USER_ROLES, REDIRECT_PATHS, getUserDashboardPath } from './constants';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';

/**
 * Get current session in server context
 * Safe to use in Server Components and API Routes
 */
export async function getSession(): Promise<Session | null> {
  return await auth();
}

/**
 * Require authenticated session in server context
 * Automatically redirects unauthenticated users to login page
 * 
 * @returns Session object guaranteed to be authenticated
 * @throws Redirects to login if not authenticated
 * 
 * Usage in Server Component:
 * ```tsx
 * export default async function ProtectedPage() {
 *   const session = await requireAuth();
 *   console.log('User:', session.user.email);
 * }
 * ```
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth();
  
  if (!session?.user) {
    redirect(REDIRECT_PATHS.LOGIN);
  }
  
  return session;
}

/**
 * Require ADMIN role in server context
 * Automatically redirects non-admin users to unauthorized page
 * 
 * @returns Session object guaranteed to be from admin user
 * @throws Redirects to unauthorized if not admin
 * 
 * Usage in Server Component:
 * ```tsx
 * export default async function AdminPage() {
 *   const session = await requireAdmin();
 *   console.log('Admin:', session.user.email);
 * }
 * ```
 */
export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  
  if (!session?.user) {
    redirect(REDIRECT_PATHS.LOGIN);
  }
  
  if (session.user.role !== USER_ROLES.ADMIN) {
    redirect(REDIRECT_PATHS.UNAUTHORIZED);
  }
  
  return session;
}

/**
 * Require USER role in server context
 * Automatically redirects non-users to unauthorized page
 */
export async function requireUser(): Promise<Session> {
  const session = await auth();
  
  if (!session?.user) {
    redirect(REDIRECT_PATHS.LOGIN);
  }
  
  if (session.user.role !== USER_ROLES.USER) {
    redirect(REDIRECT_PATHS.UNAUTHORIZED);
  }
  
  return session;
}

/**
 * Require specific role in server context
 */
export async function requireRole(requiredRole: string): Promise<Session> {
  const session = await auth();
  
  if (!session?.user) {
    redirect(REDIRECT_PATHS.LOGIN);
  }
  
  if (session.user.role !== requiredRole) {
    redirect(REDIRECT_PATHS.UNAUTHORIZED);
  }
  
  return session;
}

/**
 * Check if user is admin in server context
 * Does not redirect, safe to use for conditional rendering
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === USER_ROLES.ADMIN;
}

/**
 * Check if user is authenticated in server context
 * Does not redirect, safe to use for conditional rendering
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Get user's dashboard path based on their role
 * Useful for redirect logic
 */
export async function getUserDashboard(): Promise<string> {
  const session = await auth();
  
  if (!session?.user?.role) {
    return REDIRECT_PATHS.LOGIN;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getUserDashboardPath(session.user.role as any);
}

/**
 * Verify user has required permission
 * Throws if user lacks permission
 */
export async function verifyPermission(requiredRole: string): Promise<void> {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Unauthorized: No session');
  }
  
  if (session.user.role !== requiredRole) {
    throw new Error(`Unauthorized: Required role ${requiredRole}, got ${session.user.role}`);
  }
}
