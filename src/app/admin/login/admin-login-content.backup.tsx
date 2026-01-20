'use client';

/**
 * Admin Login Component
 * Separated routing and refactored for clarity
 * - Strict admin-only authentication
 * - Role-based redirection with validation
 * - Security logging and monitoring
 * - Prevents customer accounts from admin access
 * 
 * CRITICAL: This component enforces strict role-based routing
 * to prevent privilege escalation and unauthorized admin access
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth-constants';
import BaseLoginForm, {
  LoginLoadingState,
  LoginRedirectingState,
} from '@/components/auth/base-login-form';
import {
  LOGIN_ROLE_CONFIG,
  validateRoleForRoute,
  shouldRedirectAuthenticatedUser,
  logAuthEvent,
  fetchAndVerifySession,
} from '@/lib/login-utils';

export default function AdminLoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roleMismatchError, setRoleMismatchError] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();

  const roleConfig = LOGIN_ROLE_CONFIG[USER_ROLES.ADMIN];

  /**
   * PHASE 1: Verify current authentication state
   * - If admin already authenticated → redirect to admin dashboard
   * - If customer authenticated → show error, block access
   * - If not authenticated → show login form
   */
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    setIsVerifying(false);

    if (status !== 'authenticated' || !session?.user) {
      // Not authenticated - allow to see login form
      logAuthEvent('[ADMIN_LOGIN] NOT_AUTHENTICATED', {
        pathname: '/admin/login',
      });
      return;
    }

    // User is authenticated - check role
    const { shouldRedirect, redirectPath } = shouldRedirectAuthenticatedUser(
      session.user.role || USER_ROLES.USER,
      roleConfig.route
    );

    if (shouldRedirect && redirectPath) {
      logAuthEvent('[ADMIN_LOGIN] REDIRECT_AUTHENTICATED', {
        userId: session.user.id,
        role: session.user.role,
        from: roleConfig.route,
        to: redirectPath,
      });

      // Customer on admin login page - show error
      if (session.user.role !== USER_ROLES.ADMIN) {
        setRoleMismatchError(roleConfig.roleMismatchError);
        return;
      }

      // Admin on admin login page - redirect to dashboard
      setIsRedirecting(true);
      router.replace(redirectPath);
    }
  }, [status, session?.user, router, roleConfig]);
  /**
   * PHASE 2: Handle admin login form submission
   * - Validate credentials against Admin table
   * - Verify password with bcrypt validation
   * - Route ONLY to admin dashboard (strict routing)
   * - Block customer accounts from admin access
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRoleMismatchError('');

    try {
      logAuthEvent('[ADMIN_LOGIN] ATTEMPT_LOGIN', { email });

      // Step 1: Validate credentials against Admin table API
      const adminLoginResponse = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const adminLoginData = await adminLoginResponse.json();

      if (!adminLoginResponse.ok) {
        logAuthEvent('[ADMIN_LOGIN] CREDENTIALS_REJECTED', {
          email,
          error: adminLoginData.message,
          status: adminLoginResponse.status,
        });

        // Handle locked account
        if (adminLoginResponse.status === 423) {
          toast({
            title: 'Account Locked',
            description: adminLoginData.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Authentication Failed',
            description: adminLoginData.message || 'Invalid email or password. Please try again.',
            variant: 'destructive',
          });
        }
        setPassword('');
        return;
      }

      // Step 2: Now sign in via NextAuth for session management
      logAuthEvent('[ADMIN_LOGIN] NEXTAUTH_SIGNIN', { email });

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        logAuthEvent('[ADMIN_LOGIN] NEXTAUTH_FAILED', {
          email,
          error: result.error,
        });

        toast({
          title: 'Session Error',
          description: 'Could not create session. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (!result?.ok) {
        logAuthEvent('[ADMIN_LOGIN] SIGNIN_UNSUCCESSFUL', { email });

        toast({
          title: 'Authentication Failed',
          description: 'Could not authenticate. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Step 3: Fetch and verify session
      logAuthEvent('[ADMIN_LOGIN] VERIFY_ROLE', { email });

      const newSession = await fetchAndVerifySession();

      // Step 4: STRICT ROUTING - Validate admin role before redirect
      const validation = validateRoleForRoute(
        newSession?.user?.role || USER_ROLES.USER,
        roleConfig.route
      );

      if (!validation.isValid) {
        logAuthEvent('[ADMIN_LOGIN] ROLE_MISMATCH', {
          email,
          expectedRole: USER_ROLES.ADMIN,
          actualRole: newSession?.user?.role,
        });

        setRoleMismatchError(validation.mismatchError || '');
        setPassword('');
        return;
      }

      // Step 5: Success - redirect to admin dashboard ONLY
      logAuthEvent('[ADMIN_LOGIN] SUCCESS', {
        adminId: adminLoginData.admin?.id,
        email: newSession.user.email,
        role: adminLoginData.admin?.adminRole,
        destinationRoute: REDIRECT_PATHS.ADMIN_DASHBOARD,
      });

      toast({
        title: 'Welcome Admin!',
        description: `Signed in as ${newSession.user.email}`,
      });

      setIsRedirecting(true);
      router.replace(REDIRECT_PATHS.ADMIN_DASHBOARD);
    } catch (error) {
      logAuthEvent('[ADMIN_LOGIN] ERROR', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render loading state while verifying session
   */
  if (isVerifying) {
    return (
      <LoginLoadingState message="Verifying admin session..." />
    );
  }

  /**
   * Render redirect state for already authenticated admins
   */
  if (isRedirecting) {
    return (
      <LoginRedirectingState message="Redirecting to admin dashboard..." />
    );
  }

  /**
   * Render login form
   */
  return (
    <BaseLoginForm
      roleConfig={roleConfig}
      email={email}
      password={password}
      isLoading={isLoading}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      roleMismatchError={roleMismatchError}
    />
  );
}
