import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { USER_ROLES } from '@/lib/auth-constants';
import UsersClient from './UsersClient';

async function getUsersData() {
  const users = await prisma.users.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      companies: { select: { name: true } },
      _count: {
        select: {
          quotes: true,
        },
      },
    },
  });

  return users.map((user) => ({
    id: user.id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    emailVerified: !!user.emailVerified,
    isActive: user.isActive,
    company: user.company?.name || null,
    quotesCount: user._count.quotes,
    ordersCount: 0, // Orders not in schema yet
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  }));
}

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== USER_ROLES.ADMIN) {
    redirect('/403');
  }

  const users = await getUsersData();

  return <UsersClient users={users} />;
}
