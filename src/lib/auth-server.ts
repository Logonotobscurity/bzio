import { auth } from '@/lib/auth';
import { USER_ROLES } from '@/lib/auth-constants';
import { redirect } from 'next/navigation';

export async function getServerSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session.user as any).role !== USER_ROLES.ADMIN) {
    redirect('/403');
  }
  return session;
}

export async function getUserRole() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session?.user as any)?.role || null;
}

export async function isAdmin() {
  const role = await getUserRole();
  return role === USER_ROLES.ADMIN;
}

export async function isCustomer() {
  const role = await getUserRole();
  return role === USER_ROLES.CUSTOMER;
}
