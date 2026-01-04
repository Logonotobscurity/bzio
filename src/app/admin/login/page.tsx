'use client';

import { Suspense } from 'react';
import AdminLoginPageContent from './admin-login-content';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <AdminLoginPageContent />
    </Suspense>
  );
}
