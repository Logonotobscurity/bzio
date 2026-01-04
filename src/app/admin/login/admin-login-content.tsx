'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth-constants';
import { AlertCircle, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Admin Login Component - Strict Routing to Admin Dashboard
 * 
 * CRITICAL ROUTING RULES:
 * 1. Unauthenticated user logs in → REDIRECT TO /admin dashboard
 * 2. Already authenticated admin lands here → REDIRECT TO /admin dashboard  
 * 3. Customer account tries admin login → SHOW ERROR, block access
 * 4. Never redirect admin to home page, landing page, or customer dashboard
 * 
 * This component implements strict role-based routing to ensure:
 * - Admins ALWAYS end up on /admin dashboard after login
 * - Customers NEVER gain admin access
 * - Session is verified before routing
 */
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

  /**
   * Phase 1: Check if user is already authenticated
   * If yes and admin → redirect to dashboard
   * If yes and customer → show error
   * If no → show login form
   */
  useEffect(() => {
    if (status === 'loading') {
      return; // Still loading session
    }

    setIsVerifying(false);

    if (status === 'authenticated' && session?.user) {
      const isAdmin = session.user.role === USER_ROLES.ADMIN;

      if (isAdmin) {
        // Already authenticated as admin - redirect to dashboard
        console.log('[ADMIN_LOGIN] Already authenticated admin detected, redirecting to /admin', {
          userId: session.user.id,
          role: session.user.role,
          timestamp: new Date().toISOString(),
        });

        setIsRedirecting(true);
        router.replace(REDIRECT_PATHS.ADMIN_DASHBOARD);
      } else {
        // Authenticated but not admin - show error
        console.log('[ADMIN_LOGIN] Non-admin user on admin login page', {
          userId: session.user.id,
          role: session.user.role,
          timestamp: new Date().toISOString(),
        });

        setRoleMismatchError(
          'Your account does not have administrator privileges. ' +
          'Please use the customer login interface.'
        );
      }
    }
  }, [status, session?.user?.role, router]);

  /**
   * Phase 2: Handle admin login form submission
   * STRICT ROUTING: Must verify role before any redirect
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRoleMismatchError('');

    try {
      console.log('[ADMIN_LOGIN] Login attempt', {
        email,
        timestamp: new Date().toISOString(),
      });

      // Step 1: Attempt sign in
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // CRITICAL: Manual redirect for strict routing
      });

      if (result?.error) {
        console.log('[ADMIN_LOGIN] Credentials rejected', {
          email,
          error: result.error,
        });

        toast({
          title: 'Authentication Failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (!result?.ok) {
        console.log('[ADMIN_LOGIN] Sign in unsuccessful', { email });
        toast({
          title: 'Authentication Failed',
          description: 'Could not authenticate. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Step 2: Refresh session to verify role
      console.log('[ADMIN_LOGIN] Credentials accepted, verifying role', { email });

      const sessionResponse = await fetch('/api/auth/session');
      const newSession = await sessionResponse.json();

      console.log('[ADMIN_LOGIN] Session verified', {
        userId: newSession?.user?.id,
        role: newSession?.user?.role,
        email: newSession?.user?.email,
      });

      // Step 3: STRICT ROUTING - Verify admin role before redirect
      if (newSession?.user?.role === USER_ROLES.ADMIN) {
        console.log('[ADMIN_LOGIN] Admin authenticated successfully, routing to /admin ONLY', {
          userId: newSession.user.id,
          email: newSession.user.email,
          destinationRoute: REDIRECT_PATHS.ADMIN_DASHBOARD,
          timestamp: new Date().toISOString(),
        });

        toast({
          title: 'Welcome Admin!',
          description: `Signed in as ${newSession.user.email}`,
        });

        // CRITICAL: Use replace to prevent back button
        // CRITICAL: Route ONLY to /admin dashboard
        setIsRedirecting(true);
        router.replace(REDIRECT_PATHS.ADMIN_DASHBOARD);
      } else {
        // Role mismatch - customer tried admin login
        console.log('[ADMIN_LOGIN] Role mismatch - non-admin account', {
          email,
          role: newSession?.user?.role,
          expectedRole: USER_ROLES.ADMIN,
        });

        setRoleMismatchError(
          'Your account does not have administrator privileges. ' +
          'Please use the customer login interface.'
        );
        setPassword(''); // Clear for security
      }
    } catch (error) {
      console.error('[ADMIN_LOGIN] Error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while verifying current session
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  // Show redirecting state for already authenticated admins
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4 animate-pulse" />
          <p className="text-white font-semibold">Redirecting to admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {/* Header with warning banner */}
        <div className="space-y-4">
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              This area is restricted to authorized administrators only. Unauthorized access attempts are monitored and logged.
            </AlertDescription>
          </Alert>

          <div className="text-center pt-2">
            <div className="flex justify-center mb-3">
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Secure access for system administrators
            </p>
          </div>
        </div>

        {/* Role mismatch error */}
        {roleMismatchError && (
          <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {roleMismatchError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login as Administrator'
            )}
          </Button>
        </form>

        {/* Role mismatch redirect link */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Not an administrator?{' '}
            <Link
              href={REDIRECT_PATHS.LOGIN}
              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Login as customer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
