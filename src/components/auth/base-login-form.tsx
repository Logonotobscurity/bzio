'use client';

/**
 * Base Login Component
 * Provides common UI structure and logic for both customer and admin login flows
 * Role-specific behavior is controlled via roleConfig prop
 */

// Component imports
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Define RoleConfig interface for proper typing
interface RoleConfig {
  [key: string]: unknown;
  warningBanner?: boolean;
  securityMessage?: string;
  headerIcon?: string;
  headerColor?: string;
  pageTitle?: string;
  pageDescription?: string;
  submitButtonText?: string;
  switchRoleText?: string;
  switchRoleLinkText?: string;
}

// Dynamically import icon based on config to avoid prop drilling
const IconMap = {
  User: dynamic(() => import('lucide-react').then(mod => ({ default: mod.User })), {
    loading: () => <div className="w-8 h-8" />,
  }),
  Shield: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Shield })), {
    loading: () => <div className="w-8 h-8" />,
  }),
};

/**
 * Base login form component
 * Handles rendering of common login UI elements
 */
function BaseLoginForm({
  roleConfig,
  email,
  password,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onMagicLink,
  roleMismatchError,
}: {
  roleConfig: RoleConfig;
  email: string;
  password: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onMagicLink?: () => Promise<void>;
  roleMismatchError: string;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {/* Header with optional warning banner */}
        <div className="space-y-4">
          {roleConfig.warningBanner && (
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                {(roleConfig.securityMessage as string)}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center pt-2">
            <div className="flex justify-center mb-3">
              {roleConfig.headerIcon === 'User' && (
                <IconMap.User className={`w-8 h-8 ${(roleConfig.headerColor as string) || ''}`} />
              )}
              {roleConfig.headerIcon === 'Shield' && (
                <IconMap.Shield className={`w-8 h-8 ${(roleConfig.headerColor as string) || ''}`} />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {(roleConfig.pageTitle as string)}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {(roleConfig.pageDescription as string)}
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

        {/* Login form */}
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={
                roleConfig.role === "ADMIN"
                  ? 'admin@example.com'
                  : 'you@example.com'
              }
              required
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
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
              onChange={(e) => onPasswordChange(e.target.value)}
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className={`w-full text-white font-semibold ${roleConfig.buttonColor || ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              (roleConfig.buttonText as string) || 'Login'
            )}
          </Button>
        </form>

        {/* Magic link option for customer login */}
        {onMagicLink && (
          <>
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
              onClick={onMagicLink}
              className="w-full"
              variant="secondary"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </>
        )}

        {/* Footer with role switch links */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {roleConfig.role === 'customer' && (
            <>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Register here
                </Link>
              </p>

              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                {(roleConfig.switchRoleText as string)}{' '}
                <Link
                  href={roleConfig.switchRoleLink as string}
                  className="font-medium text-purple-600 hover:underline dark:text-purple-500"
                >
                  {(roleConfig.switchRoleLinkText as string)}
                </Link>
              </p>
            </>
          )}

          {roleConfig.role === "ADMIN" && (
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              {(roleConfig.switchRoleText as string)}{' '}
              <Link
                href={roleConfig.switchRoleLink as string}
                className="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                {(roleConfig.switchRoleLinkText as string)}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading state component
 */
export function LoginLoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * Redirect state component
 */
export function LoginRedirectingState({ message = 'Redirecting...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
        <p className="text-white font-semibold">{message}</p>
      </div>
    </div>
  );
}

export default BaseLoginForm;
