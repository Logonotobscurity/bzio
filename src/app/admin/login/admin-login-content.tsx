'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth-constants';
import { AlertCircle, Shield, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Admin Login Component - No Auto-Login
 * Always requires manual credential entry
 */
export default function AdminLoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roleMismatchError, setRoleMismatchError] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRoleMismatchError('');

    try {
      // Validate inputs
      if (!email || !password) {
        toast({
          title: 'Validation Error',
          description: 'Email and password are required.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Attempt to sign in with credentials
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setIsLoading(false);
        toast({
          title: 'Authentication Failed',
          description: 'Invalid email or password.',
          variant: 'destructive',
        });
        return;
      }

      if (!result?.ok) {
        setIsLoading(false);
        toast({
          title: 'Authentication Failed',
          description: 'Could not authenticate.',
          variant: 'destructive',
        });
        return;
      }

      // Verify admin role via API
      const verifyResponse = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!verifyResponse.ok) {
        setIsLoading(false);
        setRoleMismatchError(
          'Your account does not have administrator privileges. ' +
          'Please use the customer login interface.'
        );
        setPassword('');
        return;
      }

      const verifyData = await verifyResponse.json();

      if (!verifyData.isAdmin) {
        setIsLoading(false);
        setRoleMismatchError(
          'Your account does not have administrator privileges. ' +
          'Please use the customer login interface.'
        );
        setPassword('');
        return;
      }

      // Authentication successful - show success message
      toast({
        title: 'Welcome Admin!',
        description: `Signed in as ${email}`,
      });

      // Use Next.js router for client-side navigation
      // This ensures proper page transition without full reload
      router.push(REDIRECT_PATHS.ADMIN_DASHBOARD);
    } catch (error) {
      setIsLoading(false);
      console.error('[ADMIN_LOGIN] Error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
              href="/login"
              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Back to login selection
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
