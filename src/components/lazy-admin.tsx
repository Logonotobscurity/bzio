'use client';

import dynamic from 'next/dynamic';
import { Suspense, ReactNode } from 'react';

/**
 * Lazy-loaded Admin Components
 * The admin section is protected and only loaded when needed
 * This significantly reduces the main bundle size for public visitors
 */

// Lazy load the full admin dashboard client component
export const LazyAdminDashboardClient = dynamic(
  () => import('@/app/admin/_components/AdminDashboardClient'),
  {
    loading: () => <AdminDashboardSkeleton />,
    ssr: false,
  }
);

// Lazy load admin notifications component
export const LazyAdminNotifications = dynamic(
  () => import('@/app/admin/_components/AdminNotifications').then(mod => ({
    default: mod.AdminNotifications
  })),
  {
    loading: () => <div className="h-20 bg-slate-100 rounded animate-pulse" />,
    ssr: false,
  }
);

/**
 * Loading skeleton for admin dashboard
 */
function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="h-10 bg-slate-100 rounded-lg animate-pulse w-1/3" />
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="h-96 bg-slate-100 rounded-lg animate-pulse" />
    </div>
  );
}

/**
 * Wrapper component with Suspense boundary for admin sections
 * Usage:
 * <AdminSectionBoundary>
 *   <LazyAdminDashboardClient {...props} />
 * </AdminSectionBoundary>
 */
export function AdminSectionBoundary({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      {children}
    </Suspense>
  );
}
