'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300">Redirecting to admin login...</p>
      </div>
    </div>
  );
}
