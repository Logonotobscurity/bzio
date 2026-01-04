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
import { AlertCircle, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Customer login page component
 * Provides authentication interface for end-users and customers
 * Includes role validation to redirect administrators to proper interface
 */
export default function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roleMismatchError, setRoleMismatchError] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Handle redirects for already logged-in users
  // NOTE: Middleware (proxy.ts) also handles this redirect
  // This useEffect ensures smooth UX for authenticated users who land on /login
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const isAdmin = session.user.role === USER_ROLES.ADMIN;
      
      if (isAdmin) {
        // Admin user - redirect to admin dashboard
        console.log('[CUSTOMER_LOGIN_REDIRECT] Admin user redirected to admin dashboard', {
          userId: session.user?.id,
          role: session.user?.role,
          timestamp: new Date().toISOString(),
        });
        router.replace(REDIRECT_PATHS.ADMIN_DASHBOARD);
      } else {
        // Customer user - redirect to customer dashboard
        console.log('[CUSTOMER_LOGIN_REDIRECT] Authenticated customer redirect', {
          userId: session.user?.id,
          role: session.user?.role,
          redirectUrl: REDIRECT_PATHS.USER_DASHBOARD,
          timestamp: new Date().toISOString(),
        });
        router.replace(REDIRECT_PATHS.USER_DASHBOARD);
      }
    }
  }, [status, session?.user?.role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRoleMismatchError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Important: We are handling the redirect manually
      });

      if (result?.error) {
        toast({
          title: 'Authentication Failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      } else if (result?.ok) {
        // Credentials were valid - verify role
        const sessionResponse = await fetch('/api/auth/session');
        const newSession = await sessionResponse.json();

        if (newSession?.user?.role === USER_ROLES.ADMIN) {
          // Role mismatch - admin account attempting customer login
          setRoleMismatchError(
            'Your account has administrator privileges. ' +
            'Please use the administrator login interface to access the admin dashboard.'
          );
          // Clear password field for security
          setPassword('');
          console.log('[CUSTOMER_LOGIN] Admin attempted customer login', {
            email,
            role: newSession.user?.role,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Correct role - redirect to customer dashboard
          console.log('[CUSTOMER_LOGIN] Customer authentication successful', {
            userId: newSession.user?.id,
            email: newSession.user?.email,
            timestamp: new Date().toISOString(),
          });
          
          router.replace(REDIRECT_PATHS.USER_DASHBOARD);
        }
      }
    } catch (error) {
      console.error('[CUSTOMER_LOGIN] Error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address to receive a magic link.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setRoleMismatchError('');
    try {
      await signIn('email', { email, redirect: false });
      toast({
        title: 'Magic Link Sent',
        description: 'Check your email for a link to log in.',
      });
    } catch (error) {
      console.error('[CUSTOMER_LOGIN] Magic link error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If loading session, show a loading state to prevent flickering
  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Login</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Sign in to your customer account
          </p>
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
              placeholder="you@example.com"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          onClick={handleMagicLink}
          className="w-full"
          variant="secondary"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Magic Link'}
        </Button>

        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
              Register here
            </Link>
          </p>

          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Are you an administrator?{' '}
            <Link href="/admin/login" className="font-medium text-purple-600 hover:underline dark:text-purple-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
