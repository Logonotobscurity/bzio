'use client';

import { useSession } from 'next-auth/react';
import { USER_ROLES } from '@/lib/auth-constants';

export function useAuth() {
  const { data: session, status } = useSession();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const role = user?.role;
  
  return {
    session,
    user,
    role,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    isAdmin: role === USER_ROLES.ADMIN,
    isCustomer: role === USER_ROLES.CUSTOMER,
  };
}

export function useRequireAuth() {
  const auth = useAuth();
  
  if (!auth.isLoading && !auth.isAuthenticated) {
    window.location.href = '/login';
  }
  
  return auth;
}

export function useRequireAdmin() {
  const auth = useAuth();
  
  if (!auth.isLoading) {
    if (!auth.isAuthenticated) {
      window.location.href = '/login';
    } else if (!auth.isAdmin) {
      window.location.href = '/403';
    }
  }
  
  return auth;
}
