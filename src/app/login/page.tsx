'use client';

import { Suspense } from 'react';
import LoginSelectionContent from './login-selection-content';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <LoginSelectionContent />
    </Suspense>
  );
}
