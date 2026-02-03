'use client';

/**
 * ADMIN AUTHENTICATION CONTENT COMPONENT
 * 
 * Purpose: Handle admin-specific authentication flow
 * Route: /auth/admin/login
 * 
 * Key Features:
 * - Admin-only credential validation (rejects customer accounts)
 * - Strict role enforcement before dashboard redirect
 * - Security logging and monitoring
 * - Defense against privilege escalation
 * - Session verification and validation
 * 
 * Access Flow:
 * Unauthenticated → Login form → Verify credentials → Check role === 'admin'
 * → Auto-redirect to /admin dashboard → Access admin features
 * 
 * Blocking Scenarios:
 * 1. Customer account attempting admin login → Error message
 * 2. Wrong password → Authentication failed
 * 3. Non-existent email → Authentication failed
 * 4. Customer on this page → Redirect to /account
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { USER_ROLES } from '@/lib/auth/constants';
import BaseLoginForm, {
  LoginLoadingState,
  LoginRedirectingState,
} from '@/components/auth/base-login-form';
import {
  LOGIN_ROLE_CONFIG,
  validateRoleForRoute,
  getRedirectPathByRole,
  shouldRedirectAuthenticatedUser,
  logAuthEvent,
  fetchAndVerifySession,
} from '@/lib/login-utils';

export default function AdminAuthContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roleMismatchError, setRoleMismatchError] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();

  /**
   * PHASE 1: Verify current authentication state
   * 
   * This phase ensures:
   * 1. Admin users who are already logged in get redirected to /admin
   * 2. Customer users are blocked with an error message
   * 3. Unauthenticated users can see the login form
   */
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    setIsVerifying(false);

    if (status !== 'authenticated' || !session?.user) {
      // Not authenticated - allow to see login form
      logAuthEvent('[ADMIN_AUTH] UNAUTHENTICATED_ACCESS', {
        pathname: '/auth/admin/login',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // User is authenticated - check role
    const { shouldRedirect, redirectPath } = shouldRedirectAuthenticatedUser(
      session.user.role || USER_ROLES.USER,
      '/auth/admin/login'
    );

    if (shouldRedirect && redirectPath) {
      logAuthEvent('[ADMIN_AUTH] AUTHENTICATED_USER_ACTION', {
        userId: session.user.id,
        userRole: session.user.role,
        pathname: '/auth/admin/login',
        action: session.user.role === USER_ROLES.ADMIN ? 'REDIRECT_TO_DASHBOARD' : 'BLOCK_CUSTOMER',
        targetRedirect: redirectPath,
        timestamp: new Date().toISOString(),
      });

      // Customer on admin login page - show error and block access
      if (session.user.role !== USER_ROLES.ADMIN) {
        setRoleMismatchError(
          'This admin login page is for administrators only. ' +
          'If you are a customer, please use the customer login page.'
        );
        logAuthEvent('[ADMIN_AUTH] CUSTOMER_BLOCKED', {
          userId: session.user.id,
          email: session.user.email,
          attemptedRoute: '/auth/admin/login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Admin already authenticated - redirect to dashboard
      setIsRedirecting(true);
      router.replace(redirectPath);
    }
  }, [status, session?.user, router]);

  /**
   * PHASE 2: Handle admin login form submission
   * 
   * This phase performs:
   * 1. Credential validation (email + password)
   * 2. Account lookup and role verification
   * 3. Strict admin-role enforcement (rejects customer accounts)
   * 4. Session creation and validation
   * 5. Redirect to /admin dashboard only
   * 
   * Security: If a customer account is used, login is rejected
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRoleMismatchError('');

    const attemptId = `admin-login-${Date.now()}`;

    try {
      logAuthEvent('[ADMIN_AUTH] LOGIN_ATTEMPT_START', {
        email,
        attemptId,
        timestamp: new Date().toISOString(),
      });

      // Step 1: Attempt sign in with credentials
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        logAuthEvent('[ADMIN_AUTH] CREDENTIALS_VALIDATION_FAILED', {
          email,
          error: result.error,
          attemptId,
          timestamp: new Date().toISOString(),
        });

        toast({
          title: 'Authentication Failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!result?.ok) {
        logAuthEvent('[ADMIN_AUTH] SIGNIN_UNSUCCESSFUL', {
          email,
          attemptId,
          timestamp: new Date().toISOString(),
        });

        toast({
          title: 'Authentication Failed',
          description: 'Could not authenticate. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Step 2: Fetch and verify session
      logAuthEvent('[ADMIN_AUTH] VERIFYING_SESSION', {
        email,
        attemptId,
        timestamp: new Date().toISOString(),
      });

      const newSession = await fetchAndVerifySession();

      // Step 3: STRICT ROLE ENFORCEMENT - Validate admin role before redirect
      const validation = validateRoleForRoute(
        newSession?.user?.role || USER_ROLES.USER,
        '/auth/admin/login'
      );

      if (!validation.isValid) {
        // User authenticated but doesn't have admin role
        logAuthEvent('[ADMIN_AUTH] ROLE_VALIDATION_FAILED', {
          email,
          userRole: newSession?.user?.role,
          requiredRole: USER_ROLES.ADMIN,
          attemptId,
          timestamp: new Date().toISOString(),
        });

        const errorMessage = 'This account does not have admin access. ' +
          'Only administrators can log in here.';

        setRoleMismatchError(errorMessage);
        toast({
          title: 'Access Denied',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Step 4: Role is valid - redirect to admin dashboard
      logAuthEvent('[ADMIN_AUTH] LOGIN_SUCCESS', {
        userId: newSession?.user?.id,
        email,
        role: newSession?.user?.role,
        attemptId,
        timestamp: new Date().toISOString(),
      });

      setIsRedirecting(true);
      const redirectPath = getRedirectPathByRole(newSession?.user?.role || USER_ROLES.USER);
      router.replace(redirectPath || '/admin');
    } catch (error: unknown) {
      logAuthEvent('[ADMIN_AUTH] ERROR_DURING_LOGIN', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
        attemptId,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  /**
   * Render States
   */

  // Verifying authentication state
  if (isVerifying) {
    return (
      <LoginLoadingState message="Verifying access..." />
    );
  }

  // Redirecting after successful login
  if (isRedirecting) {
    return (
      <LoginRedirectingState 
        message="Welcome back, Administrator! Redirecting to admin dashboard..."
      />
    );
  }

  // Blocked - customer account attempting admin access
  if (roleMismatchError && session?.user?.role !== USER_ROLES.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ❌ Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {roleMismatchError}
            </p>
            <button
              onClick={() => router.push('/auth/customer/login')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Customer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <BaseLoginForm
      roleConfig={LOGIN_ROLE_CONFIG[USER_ROLES.ADMIN]}
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      roleMismatchError={roleMismatchError}
    />
  );
}
