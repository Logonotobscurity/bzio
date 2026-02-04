'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { REDIRECT_PATHS } from '@/lib/auth-constants';

export function AdminLogoutButton() {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="w-full"
      onClick={() => signOut({ callbackUrl: REDIRECT_PATHS.ADMIN_LOGIN })}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
}