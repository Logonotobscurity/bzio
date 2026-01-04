'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { Shield, User } from 'lucide-react';
import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth-constants';

/**
 * Landing page component with dual authentication pathways
 * Serves as the primary entry point for all unauthenticated users
 * Presents two clearly differentiated authentication pathways:
 * - Customer pathway (blue user icon)
 * - Administrative pathway (purple shield icon)
 */
export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect authenticated users to their role-appropriate dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const redirectUrl = session.user.role === USER_ROLES.ADMIN
        ? REDIRECT_PATHS.ADMIN_DASHBOARD
        : REDIRECT_PATHS.USER_DASHBOARD;
      
      console.log('[LANDING_PAGE] Authenticated user redirect', {
        userId: session.user?.id,
        role: session.user?.role,
        redirectUrl,
        timestamp: new Date().toISOString(),
      });
      
      router.replace(redirectUrl);
    }
  }, [status, session?.user?.role, router]);

  // Show loading state while checking authentication
  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Unauthenticated user - show dual authentication pathways
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Bzion
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Choose your authentication pathway to continue
          </p>
        </div>

        {/* Dual Authentication Pathways */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Authentication Pathway */}
          <div
            onClick={() => router.push(REDIRECT_PATHS.LOGIN)}
            className="group cursor-pointer relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 ease-out" />
            
            <div className="relative p-8 sm:p-12 rounded-2xl bg-white dark:bg-gray-800 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="p-4 sm:p-6 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors duration-300">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Content */}
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-3">
                Customer Login
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6 sm:mb-8">
                Access your account to browse products, manage orders, and track shipments.
              </p>

              {/* CTA Button */}
              <div className="text-center">
                <button className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300">
                  Login as Customer
                </button>
              </div>

              {/* Hover indicator */}
              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                Click to continue
              </div>
            </div>
          </div>

          {/* Administrative Authentication Pathway */}
          <div
            onClick={() => router.push('/admin/login')}
            className="group cursor-pointer relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 ease-out" />
            
            <div className="relative p-8 sm:p-12 rounded-2xl bg-white dark:bg-gray-800 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="p-4 sm:p-6 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors duration-300">
                  <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400" />
                </div>
              </div>

              {/* Content */}
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-3">
                Administrator Login
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6 sm:mb-8">
                Access the administrative dashboard to manage users, analyze activities, and oversee platform operations.
              </p>

              {/* CTA Button */}
              <div className="text-center">
                <button className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-300">
                  Login as Administrator
                </button>
              </div>

              {/* Hover indicator */}
              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                Click to continue
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            By logging in, you agree to our{' '}
            <a href="/compliance/terms" className="text-blue-600 hover:underline dark:text-blue-400">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/compliance/privacy" className="text-blue-600 hover:underline dark:text-blue-400">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
