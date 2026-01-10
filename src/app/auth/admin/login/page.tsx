'use client';

import { Suspense } from 'react';
import AdminAuthContent from './admin-auth-content';

/**
 * ADMIN AUTHENTICATION PAGE
 * 
 * Isolated route for admin-only authentication
 * Located at: /auth/admin/login
 * 
 * Features:
 * - Admin-only credential validation
 * - Strict role-based routing to /admin dashboard
 * - Security logging for all login attempts
 * - Prevents customer accounts from accessing admin area
 * 
 * Access Control:
 * ✅ Unauthenticated users → Can see login form
 * ✅ Authenticated admins → Auto-redirect to /admin
 * ❌ Authenticated customers → Blocked from access
 * ❌ Non-admin accounts → Cannot login here
 */

export default function AdminAuthPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <AdminAuthContent />
    </Suspense>
  );
}
