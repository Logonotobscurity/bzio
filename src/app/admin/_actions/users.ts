"use server";

import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { USER_ROLES } from '@/lib/auth-constants';
import { revalidatePath } from "next/cache";
import { invalidateDashboardCache, CACHE_KEYS } from '@/lib/cache';
import { Prisma } from '@prisma/client';

// Helper to verify admin access
async function verifyAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const userRole = (session.user as { role?: string }).role;
  if (userRole !== USER_ROLES.ADMIN) {
    throw new Error('Forbidden');
  }
  return session;
}

// Helper to log admin actions
async function logAdminAction(eventType: string, eventData: Record<string, unknown>, userId?: number) {
  try {
    await prisma.analytics_events.create({
      data: {
        eventType,
        eventData: eventData as Prisma.InputJsonValue,
        userId,
      },
    });
  } catch (error) {
    console.error('[LOG_ADMIN_ACTION]', error);
  }
}

/**
 * Get all users with pagination and filtering
 */
export async function getUsers(options: {
  page?: number;
  limit?: number;
  role?: string;
  verified?: boolean;
  search?: string;
} = {}) {
  await verifyAdmin();
  
  const { page = 1, limit = 20, role, verified, search } = options;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  
  if (role && role !== 'all') {
    where.role = role;
  }
  
  if (verified !== undefined) {
    where.emailVerified = verified ? { not: null } : null;
  }
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        companies: { select: { name: true } },
        _count: {
          select: {
            quotes: true,
          },
        },
      },
    }),
    prisma.users.count({ where }),
  ]);

  return {
    users: users.map(user => ({
      ...user,
      password: undefined, // Never expose password
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
  await verifyAdmin();

  try {
    const oldUser = await prisma.users.findUnique({ where: { id: userId } });
    const user = await prisma.users.update({
      where: { id: userId },
      data: { role },
    });

    await logAdminAction('user_role_changed', { userId, oldRole: oldUser?.role, newRole: role });
    invalidateDashboardCache(CACHE_KEYS.RECENT_USERS);
    revalidatePath('/admin/users');

    return { success: true, user: { ...user, password: undefined } };
  } catch (error) {
    console.error('[UPDATE_USER_ROLE]', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(userId: number) {
  await verifyAdmin();

  try {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });

    await logAdminAction('user_status_toggled', { userId, newStatus: updatedUser.isActive });
    invalidateDashboardCache(CACHE_KEYS.RECENT_USERS);
    revalidatePath('/admin/users');

    return { success: true, user: { ...updatedUser, password: undefined } };
  } catch (error) {
    console.error('[TOGGLE_USER_STATUS]', error);
    return { success: false, error: 'Failed to toggle user status' };
  }
}

/**
 * Approve user (activate + verify email)
 */
export async function approveUser(userId: number) {
  await verifyAdmin();

  try {
    const user = await prisma.users.update({
      where: { id: userId },
      data: { 
        isActive: true,
        emailVerified: new Date(),
        emailVerificationToken: null,
      },
    });

    await logAdminAction('user_approved', { userId, email: user.email });
    invalidateDashboardCache(CACHE_KEYS.RECENT_USERS);
    revalidatePath('/admin/users');

    return { success: true, user: { ...user, password: undefined } };
  } catch (error) {
    console.error('[APPROVE_USER]', error);
    return { success: false, error: 'Failed to approve user' };
  }
}

/**
 * Reject/Deactivate user
 */
export async function rejectUser(userId: number, reason?: string) {
  await verifyAdmin();

  try {
    const user = await prisma.users.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await logAdminAction('user_rejected', { userId, email: user.email, reason });
    invalidateDashboardCache(CACHE_KEYS.RECENT_USERS);
    revalidatePath('/admin/users');

    return { success: true, user: { ...user, password: undefined } };
  } catch (error) {
    console.error('[REJECT_USER]', error);
    return { success: false, error: 'Failed to reject user' };
  }
}

/**
 * Verify user email manually
 */
export async function verifyUserEmail(userId: number) {
  await verifyAdmin();

  try {
    const user = await prisma.users.update({
      where: { id: userId },
      data: { 
        emailVerified: new Date(),
        emailVerificationToken: null,
      },
    });

    await logAdminAction('user_email_verified', { userId, email: user.email });
    invalidateDashboardCache(CACHE_KEYS.RECENT_USERS);
    revalidatePath('/admin/users');

    return { success: true, user: { ...user, password: undefined } };
  } catch (error) {
    console.error('[VERIFY_USER_EMAIL]', error);
    return { success: false, error: 'Failed to verify user email' };
  }
}

/**
 * Get user details
 */
export async function getUserDetails(userId: number) {
  await verifyAdmin();

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        companies: true,
        addresses: true,
        quotes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        notifications: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, user: { ...user, password: undefined } };
  } catch (error) {
    console.error('[GET_USER_DETAILS]', error);
    return { success: false, error: 'Failed to get user details' };
  }
}

/**
 * Delete user (soft delete by deactivating)
 */
export async function deleteUser(userId: number) {
  await verifyAdmin();

  try {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    // Soft delete - just deactivate
    await prisma.users.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await logAdminAction('user_deleted', { userId, email: user?.email });
    invalidateDashboardCache(CACHE_KEYS.RECENT_USERS);
    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    console.error('[DELETE_USER]', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
