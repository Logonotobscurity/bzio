'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth/constants';

/**
 * Login Selection Page
 * Presents two options: Customer Login or Admin Login
 * Routes to appropriate login form based on selection
 */
export default function LoginSelectionContent() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect already authenticated users to their dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setIsRedirecting(true);
      const isAdmin = session.user.role === USER_ROLES.ADMIN;
      const destination = isAdmin ? REDIRECT_PATHS.ADMIN_DASHBOARD : REDIRECT_PATHS.USER_DASHBOARD;
      router.replace(destination);
    }
  }, [status, session, router]);

  // Show loading state while checking session or redirecting
  if (status === 'loading' || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300">
            {isRedirecting ? 'Redirecting to dashboard...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome to BZION
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose your login type to continue
          </p>
        </div>

        {/* Login Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Login Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-blue-500">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Customer Login
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Access your customer account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Browse and request quotes for products
                  </span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Track your orders and quotes
                  </span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Manage your account and addresses
                  </span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    View product catalog and pricing
                  </span>
                </li>
              </ul>
              <Button
                onClick={() => router.push(REDIRECT_PATHS.CUSTOMER_LOGIN)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
              >
                Continue as Customer
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                  Register here
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Admin Login Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-purple-500">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Shield className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Login
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Secure access for administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Manage products and inventory
                  </span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Review and process quotes
                  </span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Monitor user activity and analytics
                  </span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Access system administration tools
                  </span>
                </li>
              </ul>
              <Button
                onClick={() => router.push(REDIRECT_PATHS.ADMIN_LOGIN)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg"
              >
                Continue as Admin
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-4">
                <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
                  ⚠️ Restricted area - Authorized personnel only
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help?{' '}
            <a href="/contact" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
