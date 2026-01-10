'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Account error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Account Error
        </h2>
        <p className="text-gray-600 mb-8">
          An error occurred while loading your account. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
