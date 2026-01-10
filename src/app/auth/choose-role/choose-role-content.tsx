'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth-constants';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, Users, ArrowRight, LogIn } from 'lucide-react';

/**
 * Role Selection Component
 * 
 * Displays two role options for users to choose from:
 * 1. Customer - For retailers, wholesalers, and end-users
 * 2. Admin - For internal system administrators
 * 
 * Features:
 * - Redirects authenticated users to their dashboard
 * - Visual role cards with descriptions
 * - Icon-based role identification
 * - Responsive design for mobile/desktop
 * - Loading states and error handling
 */
export default function ChooseRoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin' | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('[CHOOSE_ROLE] Authenticated user detected, redirecting to dashboard', {
        userId: session.user?.id,
        role: session.user?.role,
        timestamp: new Date().toISOString(),
      });

      const isAdmin = session.user.role === USER_ROLES.ADMIN;
      const targetPath = isAdmin ? REDIRECT_PATHS.ADMIN_DASHBOARD : REDIRECT_PATHS.USER_DASHBOARD;
      
      router.replace(targetPath);
    }
  }, [status, session?.user, router]);

  // Check for role parameter from URL
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'customer' || roleParam === 'admin') {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  // Handle role selection and navigation
  const handleRoleSelect = (role: 'customer' | 'admin') => {
    setSelectedRole(role);
    setIsNavigating(true);

    // Log role selection
    console.log('[CHOOSE_ROLE] User selected role', {
      selectedRole: role,
      timestamp: new Date().toISOString(),
    });

    // Navigate to appropriate login page after brief delay for animation
    const targetPath = role === 'admin' ? '/auth/admin/login' : '/auth/customer/login';
    
    setTimeout(() => {
      router.push(targetPath);
    }, 300);
  };

  // Show loading skeleton while hydrating or redirecting
  if (!isClient || status === 'loading' || (status === 'authenticated' && isNavigating)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-secondary/5 px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-white to-secondary/5 px-4 py-8 md:py-0">
      {/* Header Section */}
      <div className="w-full max-w-2xl mb-8 md:mb-12">
        <div className="text-center mb-2">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Welcome to BZION Hub
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose your role to get started
          </p>
        </div>
      </div>

      {/* Role Selection Cards */}
      <div className="w-full max-w-2xl grid md:grid-cols-2 gap-6 mb-8">
        {/* Customer Role Card */}
        <div
          className={`transition-all duration-300 cursor-pointer ${
            selectedRole === 'customer' ? 'transform scale-105' : 'hover:shadow-lg'
          }`}
          onClick={() => handleRoleSelect('customer')}
        >
          <Card className={`h-full overflow-hidden border-2 transition-all ${
            selectedRole === 'customer'
              ? 'border-primary bg-primary/5'
              : 'border-transparent hover:border-primary/20'
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                {selectedRole === 'customer' && (
                  <div className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                    Selected
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl">Customer</CardTitle>
              <CardDescription className="text-base">
                For retailers, wholesalers & buyers
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Access our product catalog, request quotes, manage orders, and track your purchases.
              </p>

              {/* Feature List */}
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Browse our extensive product catalog</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Request and manage quotes</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Track order status</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Manage your profile & addresses</span>
                </li>
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => handleRoleSelect('customer')}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                disabled={isNavigating}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {selectedRole === 'customer' && isNavigating ? 'Redirecting...' : 'Continue as Customer'}
              </Button>

              {/* Helper Text */}
              <p className="text-xs text-muted-foreground text-center pt-2">
                New customer? You can register after login
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Role Card */}
        <div
          className={`transition-all duration-300 cursor-pointer ${
            selectedRole === 'admin' ? 'transform scale-105' : 'hover:shadow-lg'
          }`}
          onClick={() => handleRoleSelect('admin')}
        >
          <Card className={`h-full overflow-hidden border-2 transition-all ${
            selectedRole === 'admin'
              ? 'border-primary bg-primary/5'
              : 'border-transparent hover:border-primary/20'
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <ShieldCheck className="w-8 h-8 text-amber-600" />
                </div>
                {selectedRole === 'admin' && (
                  <div className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                    Selected
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl">Administrator</CardTitle>
              <CardDescription className="text-base">
                For BZION Hub internal management
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage the platform, monitor operations, process orders, and analyze business metrics.
              </p>

              {/* Feature List */}
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>View dashboard & analytics</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Manage users & customers</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Process quotes & orders</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Monitor platform health</span>
                </li>
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => handleRoleSelect('admin')}
                className="w-full mt-6 bg-amber-600 hover:bg-amber-700"
                disabled={isNavigating}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {selectedRole === 'admin' && isNavigating ? 'Redirecting...' : 'Continue as Admin'}
              </Button>

              {/* Helper Text */}
              <p className="text-xs text-muted-foreground text-center pt-2">
                Restricted access - admin credentials required
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Text */}
      <div className="w-full max-w-2xl text-center mt-8 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          This is a secure access area. Only authorized accounts can proceed.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Create a customer account
          </Link>
        </p>
      </div>

      {/* Debug Info (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="w-full max-w-2xl mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <p className="text-xs font-mono text-gray-600">
            <strong>Dev Info:</strong> Session Status: {status} | Selected Role: {selectedRole || 'None'}
          </p>
        </div>
      )}
    </div>
  );
}
