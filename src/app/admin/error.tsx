'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Admin Panel Error
        </h2>
        <p className="text-gray-600 mb-8">
          An error occurred in the admin panel. Please try again or contact support.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/admin'}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
