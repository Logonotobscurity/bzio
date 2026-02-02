/**
 * User Tracking Service
 * 
 * Handles user-related event tracking and notifications
 */

import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-service';
import { broadcastAdminNotification } from '@/app/admin/_actions/notifications';

export interface UserRegistrationData {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

/**
 * Track user registration event
 */
export async function trackUserRegistration(data: UserRegistrationData): Promise<void> {
  try {
    const userName = data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : data.email;

    await logActivity(
      data.userId,
      'account_created',
      {
        email: data.email,
        companyName: data.companyName,
      }
    );

    await broadcastAdminNotification(
      'user_registration',
      'New User Registration',
      `${userName} registered with ${data.companyName || 'no company'}`,
      {
        userId: data.userId,
        email: data.email,
        companyName: data.companyName,
      }
    );

    console.log(`[User Tracking] User ${data.email} tracked successfully`);
  } catch (error) {
    console.error('[User Tracking Error]', error);
    throw error;
  }
}

/**
 * Track user login
 */
export async function trackUserLogin(userId: number, email: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });

    await logActivity(
      userId,
      'login',
      { email, timestamp: new Date().toISOString() }
    );

    console.log(`[User Tracking] Login tracked for ${email}`);
  } catch (error) {
    console.error('[User Tracking Error]', error);
    // Don't throw for login tracking - it's non-critical
  }
}

/**
 * Get user metrics
 */
export async function getUserMetrics(): Promise<{
  totalUsers: number;
  newUsersThisWeek: number;
  activeUsers: number;
}> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalUsers, newUsersThisWeek, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      prisma.user.count({
        where: {
          lastLogin: {
            gte: sevenDaysAgo,
          },
        },
      }),
    ]);

    return { totalUsers, newUsersThisWeek, activeUsers };
  } catch (error) {
    console.error('[User Metrics Error]', error);
    throw error;
  }
}
