'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth/constants';
import AdminLoginPageContent from './admin-login-content';

/**
 * Admin Login Page (Server Component)
 * Handles server-side authentication checks
 * Redirects already authenticated admins to dashboard
 */
export default async function AdminLoginPage() {
  // Check if user is already authenticated
  const session = await auth();

  // If authenticated and is admin, redirect to dashboard
  if (session?.user?.role === USER_ROLES.ADMIN) {
    redirect(REDIRECT_PATHS.ADMIN_DASHBOARD);
  }

  // If authenticated but not admin, redirect to customer dashboard
  if (session?.user) {
    redirect(REDIRECT_PATHS.USER_DASHBOARD);
  }

  // Show login form to unauthenticated users
  return <AdminLoginPageContent />;
}
