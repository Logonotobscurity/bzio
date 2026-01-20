"use server";

import { prisma } from '@/lib/prisma';
import { getCachedQuery, CACHE_TTL, CACHE_KEYS, invalidateDashboardCache } from '@/lib/cache';

export interface UserFilters {
  search?: string;
  role?: 'ADMIN' | 'CUSTOMER' | 'all';
  verified?: 'verified' | 'unverified' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface UserStats {
  total: number;
  admins: number;
  customers: number;
  verified: number;
  newThisWeek: number;
  newThisMonth: number;
}

/**
 * Get user statistics with caching
 */
export async function getUserStats(): Promise<UserStats> {
  return getCachedQuery(
    `${CACHE_KEYS.RECENT_USERS}:stats`,
    async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

      const [total, admins, customers, verified, newThisWeek, newThisMonth] = await Promise.all([
        prisma.users.count(),
        prisma.users.count({ where: { role: 'ADMIN' } }),
        prisma.users.count({ where: { role: 'CUSTOMER' } }),
        prisma.users.count({ where: { emailVerified: { not: null } } }),
        prisma.users.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.users.count({ where: { createdAt: { gte: monthAgo } } }),
      ]);

      return { total, admins, customers, verified, newThisWeek, newThisMonth };
    },
    { ttl: CACHE_TTL.SHORT }
  );
}

/**
 * Get users with filters and pagination
 */
export async function getUsers(filters: UserFilters = {}, page = 1, limit = 20) {
  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.role && filters.role !== 'all') {
    where.role = filters.role;
  }

  if (filters.verified === 'verified') {
    where.emailVerified = { not: null };
  } else if (filters.verified === 'unverified') {
    where.emailVerified = null;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) (where.createdAt as Record<string, Date>).gte = filters.dateFrom;
    if (filters.dateTo) (where.dateTo as Record<string, Date>).lte = filters.dateTo;
  }

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        companies: { select: { name: true } },
        _count: { select: { quotes: true } },
      },
    }),
    prisma.users.count({ where }),
  ]);

  return {
    users: users.map((user) => ({
      id: user.id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: !!user.emailVerified,
      company: user.company?.name || null,
      quotesCount: user._count.quotes,
      ordersCount: 0, // Orders not in schema yet
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update user role
 */
export async function updateUserRole(userId: number, role: 'ADMIN' | 'CUSTOMER') {
  const user = await prisma.users.update({
    where: { id: userId },
    data: { role , updatedAt: new Date()},
  });
  await invalidateDashboardCache(CACHE_KEYS.RECENT_USERS);
  return user;
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(userId: number) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const updated = await prisma.users.update({
    where: { id: userId },
    data: { isActive: !user.isActive , updatedAt: new Date()},
  });
  await invalidateDashboardCache(CACHE_KEYS.RECENT_USERS);
  return updated;
}

/**
 * Export users to CSV format
 */
export async function exportUsersToCSV(filters: UserFilters = {}): Promise<string> {
  const { users } = await getUsers(filters, 1, 10000);
  
  const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Company', 'Verified', 'Quotes', 'Orders', 'Created At', 'Last Login'];
  const rows = users.map((user) => [
    user.id,
    user.email,
    user.firstName || '',
    user.lastName || '',
    user.role,
    user.company || '',
    user.emailVerified ? 'Yes' : 'No',
    user.quotesCount.toString(),
    user.ordersCount.toString(),
    new Date(user.createdAt).toISOString(),
    user.lastLogin ? new Date(user.lastLogin).toISOString() : '',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
