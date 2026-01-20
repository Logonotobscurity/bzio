import prisma from '@/lib/prisma';

export type ActivityType = 
  | 'login' 
  | 'logout' 
  | 'quote_request' 
  | 'checkout' 
  | 'profile_update' 
  | 'password_reset'
  | 'email_verified'
  | 'account_created'
  | 'email_sent'
  | 'view'
  | 'cart_add'
  | 'cart_remove'
  | 'quote_create'
  | 'quote_update'
  | 'quote_submitted'
  | 'search'
  | 'purchase'
  | 'order_placement';

export interface ActivityData {
  [key: string]: string | number | boolean | null | undefined | string[] | Record<string, unknown>;
}

/**
 * Logs a user activity using the UserActivity model
 */
export async function logActivity(
  userId: number,
  activityType: ActivityType,
  data: ActivityData = {}
) {
  try {
    // Build metadata by filtering out known fields
    const metadataObj = Object.keys(data).length > 0 
      ? Object.fromEntries(
          Object.entries(data).filter(([key]) => 
            !['title', 'message', 'referenceId', 'referenceType'].includes(key)
          )
        ) 
      : null;

    await prisma.user_activities.create({
      data: {
        userId,
        activityType,
        title: (data.title as string) || null,
        description: (data.message as string) || activityType,
        referenceId: (data.referenceId as string) || null,
        referenceType: (data.referenceType as string) || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: metadataObj as any,
      },
    });
  } catch (error) {
    console.error(`Failed to log activity ${activityType} for user ${userId}:`, error);
  }
}

/**
 * Gets recent activities for a user
 */
export async function getUserActivities(userId: number, limit: number = 10) {
  try {
    const activities = await prisma.user_activities.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        activityType: true,
        title: true,
        description: true,
        referenceId: true,
        referenceType: true,
        metadata: true,
        createdAt: true,
      },
    });
    return activities;
  } catch (error) {
    console.error(`Failed to fetch activities for user ${userId}:`, error);
    return [];
  }
}

/**
 * Gets activity summary for a user
 */
export async function getActivitySummary(userId: number) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [totalActivities, viewActivities, quoteActivities, cartActivities] = await Promise.all([
      prisma.user_activities.count({
        where: { userId },
      }),
      prisma.user_activities.count({
        where: { userId, activityType: 'view', createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.user_activities.count({
        where: { userId, activityType: { in: ['quote_create', 'quote_update', 'quote_submitted'] }, createdAt: { gte: ninetyDaysAgo } },
      }),
      prisma.user_activities.count({
        where: { userId, activityType: { in: ['cart_add', 'cart_remove'] }, createdAt: { gte: ninetyDaysAgo } },
      }),
    ]);

    return {
      totalActivities,
      viewActivities,
      quoteActivities,
      cartActivities,
    };
  } catch (error) {
    console.error(`Failed to fetch activity summary for user ${userId}:`, error);
    return {
      totalLogins: 0,
      recentLogins: 0,
      quoteRequests: 0,
      checkouts: 0,
    };
  }
}
