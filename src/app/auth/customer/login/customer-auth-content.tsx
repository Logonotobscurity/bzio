'use client';

/**
 * CUSTOMER AUTHENTICATION CONTENT COMPONENT
 * 
 * Purpose: Handle customer-specific authentication flow
 * Route: /auth/customer/login
 * 
 * Key Features:
 * - Customer-only credential validation
 * - Strict role enforcement before dashboard redirect
 * - Security logging and monitoring
 * - Prevents admin accounts from accessing customer features
 * - Session verification and validation
 * 
 * Access Flow:
 * Unauthenticated → Login form → Verify credentials → Check role === 'customer'
 * → Auto-redirect to /account dashboard → Access customer features
 * 
 * Blocking Scenarios:
 * 1. Admin account attempting customer login → Error message
 * 2. Wrong password → Authentication failed
 * 3. Non-existent email → Authentication failed
 * 4. Admin on this page → Redirect to /admin
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { USER_ROLES } from '@/lib/auth-constants';
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

export default function CustomerAuthContent() {
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
   * 1. Customer users who are already logged in get redirected to /account
   * 2. Admin users are blocked with an error message
   * 3. Unauthenticated users can see the login form
   */
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    setIsVerifying(false);

    if (status !== 'authenticated' || !session?.user) {
      // Not authenticated - allow to see login form
      logAuthEvent('[CUSTOMER_AUTH] UNAUTHENTICATED_ACCESS', {
        pathname: '/auth/customer/login',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // User is authenticated - check role
    const { shouldRedirect, redirectPath } = shouldRedirectAuthenticatedUser(
      session.user.role || USER_ROLES.USER,
      '/auth/customer/login'
    );

    if (shouldRedirect && redirectPath) {
      logAuthEvent('[CUSTOMER_AUTH] AUTHENTICATED_USER_ACTION', {
        userId: session.user.id,
        userRole: session.user.role,
        pathname: '/auth/customer/login',
        action: session.user.role !== USER_ROLES.ADMIN ? 'REDIRECT_TO_DASHBOARD' : 'BLOCK_ADMIN',
        targetRedirect: redirectPath,
        timestamp: new Date().toISOString(),
      });

      // Admin on customer login page - show error and block access
      if (session.user.role === USER_ROLES.ADMIN) {
        setRoleMismatchError(
          'This customer login page is for customers only. ' +
          'If you are an administrator, please use the admin login page.'
        );
        logAuthEvent('[CUSTOMER_AUTH] ADMIN_BLOCKED', {
          userId: session.user.id,
          email: session.user.email,
          attemptedRoute: '/auth/customer/login',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Customer already authenticated - redirect to dashboard
      setIsRedirecting(true);
      router.replace(redirectPath);
    }
  }, [status, session?.user, router]);

  /**
   * PHASE 2: Handle customer login form submission
   * 
   * This phase performs:
   * 1. Credential validation (email + password)
   * 2. Account lookup and role verification
   * 3. Strict customer-role enforcement (rejects admin accounts)
   * 4. Session creation and validation
   * 5. Redirect to /account dashboard only
   * 
   * Security: If an admin account is used, login is rejected
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRoleMismatchError('');

    const attemptId = `customer-login-${Date.now()}`;

    try {
      logAuthEvent('[CUSTOMER_AUTH] LOGIN_ATTEMPT_START', {
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
        logAuthEvent('[CUSTOMER_AUTH] CREDENTIALS_VALIDATION_FAILED', {
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
        logAuthEvent('[CUSTOMER_AUTH] SIGNIN_UNSUCCESSFUL', {
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
      logAuthEvent('[CUSTOMER_AUTH] VERIFYING_SESSION', {
        email,
        attemptId,
        timestamp: new Date().toISOString(),
      });

      const newSession = await fetchAndVerifySession();

      // Step 3: STRICT ROLE ENFORCEMENT - Validate customer role before redirect
      const validation = validateRoleForRoute(
        newSession?.user?.role || USER_ROLES.USER,
        '/auth/customer/login'
      );

      if (!validation.isValid) {
        // User authenticated but doesn't have customer role (likely admin)
        logAuthEvent('[CUSTOMER_AUTH] ROLE_VALIDATION_FAILED', {
          email,
          userRole: newSession?.user?.role,
          requiredRole: USER_ROLES.USER,
          attemptId,
          timestamp: new Date().toISOString(),
        });

        const errorMessage = 'This account cannot access the customer area. ' +
          'If you are an administrator, please use the admin login page.';

        setRoleMismatchError(errorMessage);
        toast({
          title: 'Access Denied',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Step 4: Role is valid - redirect to customer dashboard
      logAuthEvent('[CUSTOMER_AUTH] LOGIN_SUCCESS', {
        userId: newSession?.user?.id,
        email,
        role: newSession?.user?.role,
        attemptId,
        timestamp: new Date().toISOString(),
      });

      setIsRedirecting(true);
      const redirectPath = getRedirectPathByRole(newSession?.user?.role || USER_ROLES.USER);
      router.replace(redirectPath || '/account');
    } catch (error: unknown) {
      logAuthEvent('[CUSTOMER_AUTH] ERROR_DURING_LOGIN', {
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
        message="Welcome back! Redirecting to your dashboard..."
      />
    );
  }

  // Blocked - admin account attempting customer access
  if (roleMismatchError && session?.user?.role === USER_ROLES.ADMIN) {
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
              onClick={() => router.push('/auth/admin/login')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Admin Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <BaseLoginForm
      roleConfig={LOGIN_ROLE_CONFIG[USER_ROLES.USER]}
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
