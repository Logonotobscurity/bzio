'use client';

import { Suspense } from 'react';
import CustomerAuthContent from '.';

/**
 * CUSTOMER AUTHENTICATION PAGE
 * 
 * Isolated route for customer-only authentication
 * Located at: /auth/customer/login
 * 
 * Features:
 * - Customer-only credential validation
 * - Strict role-based routing to /account dashboard
 * - Security logging for all login attempts
 * - Prevents admin accounts from accessing customer area
 * 
 * Access Control:
 * ✅ Unauthenticated users → Can see login form
 * ✅ Authenticated customers → Auto-redirect to /account
 * ❌ Authenticated admins → Blocked from access
 * ⚠️ Admin accounts → Cannot login here
 */

export default function CustomerAuthPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <CustomerAuthContent />
    </Suspense>
  );
}
