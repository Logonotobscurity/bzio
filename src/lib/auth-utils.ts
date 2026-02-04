/**
 * Server-Side Authentication Utilities
 * 
 * Provides safe, reusable functions for:
 * - Protecting server components (require specific roles)
 * - Protecting API routes (require specific roles)
 * - Getting session info safely
 * 
 * These functions should be used in:
 * - Server Components (async functions)
 * - API Routes (GET/POST handlers)
 * 
 * NOT for use in Client Components (use next-auth/react hooks instead)
 */

import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth/config';
import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth-constants';
import { getUserDashboardPath } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';

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
 *   return <div>Welcome, {session.user.name}</div>;
 * }
 * ```
 * 
 * Usage in API Route:
 * ```tsx
 * export async function GET(request: Request) {
 *   const session = await requireAdmin();
 *   // Safe to proceed - user is admin
 *   return NextResponse.json({ data: adminData });
 * }
 * ```
 */
export async function requireAdmin() {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    // Not authenticated - redirect to login
    redirect(REDIRECT_PATHS.LOGIN);
  }
  
  if (session.user?.role !== USER_ROLES.ADMIN) {
    // Authenticated but not admin - redirect to unauthorized
    console.log('[AUTH] Non-admin user attempted to access admin resource', {
      userId: session.user?.id,
      role: session.user?.role,
      timestamp: new Date().toISOString(),
    });
    redirect(REDIRECT_PATHS.UNAUTHORIZED);
  }
  
  // Safe to return - user is authenticated admin
  return session;
}

/**
 * Require authentication (any role)
 * Automatically redirects unauthenticated users to login
 * 
 * @returns Session object guaranteed to be from authenticated user
 * @throws Redirects to login if not authenticated
 * 
 * Usage in Server Component:
 * ```tsx
 * export default async function ProtectedPage() {
 *   const session = await requireAuth();
 *   return <div>Welcome back, {session.user.name}</div>;
 * }
 * ```
 * 
 * Usage in API Route:
 * ```tsx
 * export async function POST(request: Request) {
 *   const session = await requireAuth();
 *   // Safe to proceed - user is authenticated
 *   const userId = session.user.id;
 *   return NextResponse.json({ success: true });
 * }
 * ```
 */
export async function requireAuth() {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    // Not authenticated - redirect to login
    console.log('[AUTH] Unauthenticated user attempted to access protected resource', {
      timestamp: new Date().toISOString(),
    });
    redirect(REDIRECT_PATHS.LOGIN);
  }
  
  return session;
}

/**
 * Get session safely without redirecting
 * Use when you need to handle missing session gracefully
 * 
 * @returns Session object or null if not authenticated
 * 
 * Usage in Server Component:
 * ```tsx
 * export default async function OptionalAuthComponent() {
 *   const session = await getSessionSafe();
 *   return session ? (
 *     <div>Welcome, {session.user.name}</div>
 *   ) : (
 *     <Link href="/login">Sign in</Link>
 *   );
 * }
 * ```
 */
export async function getSessionSafe() {
  return await getServerSession(authConfig);
}

/**
 * Check if session user is admin (null-safe)
 * 
 * @param session - Session object to check
 * @returns true if session exists and user has ADMIN role
 * 
 * Usage:
 * ```tsx
 * const session = await getSessionSafe();
 * if (isSessionAdmin(session)) {
 *   // Show admin UI
 * }
 * ```
 */
export function isSessionAdmin(session: any): boolean {
  return session?.user?.role === USER_ROLES.ADMIN;
}

/**
 * Check if session user is authenticated
 * 
 * @param session - Session object to check
 * @returns true if session exists
 * 
 * Usage:
 * ```tsx
 * const session = await getSessionSafe();
 * if (isSessionValid(session)) {
 *   // User is authenticated
 * }
 * ```
 */
export function isSessionValid(session: any): boolean {
  return !!session?.user?.id;
}

/**
 * Get user's correct dashboard path
 * 
 * @param session - Session object containing user role
 * @returns Dashboard path based on user's role
 * 
 * Usage:
 * ```tsx
 * const session = await getSessionSafe();
 * if (session) {
 *   const dashPath = getDashboardPath(session);
 *   redirect(dashPath);
 * }
 * ```
 */
export function getDashboardPath(session: any): string {
  return getUserDashboardPath(session?.user?.role);
}
