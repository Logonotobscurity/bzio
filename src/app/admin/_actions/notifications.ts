import { prisma } from '@/lib/db';

export type NotificationType = 'new_quote' | 'new_form' | 'new_user' | 'quote_message' | 'new_newsletter' | 'quote_request' | 'quote_status_change' | 'user_registration';

export interface NotificationPayload {
  adminId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, string | number | boolean | null>;
  actionUrl?: string;
}

/**
 * Create a notification for an admin
 * Can be called from API routes or server actions
 */
export async function createAdminNotification(payload: NotificationPayload) {
  try {
    const notification = await prisma.adminNotification.create({
      data: {
        adminId: payload.adminId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data || {},
        actionUrl: payload.actionUrl || null,
        read: false,
      },
    });

    return notification;
  } catch (error) {
    console.error('Failed to create admin notification:', error);
    // Don't throw - notification failure shouldn't break the main operation
    return null;
  }
}

/**
 * Broadcast a notification to all admins
 */
export async function broadcastAdminNotification(
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, string | number | boolean | null>,
  actionUrl?: string
) {
  try {
    // Get all admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    // Create notification for each admin
    const notifications = await Promise.all(
      admins.map((admin: typeof admins[number]) =>
        createAdminNotification({
          adminId: admin.id,
          type,
          title,
          message,
          data,
          actionUrl,
        })
      )
    );

    return notifications.filter(Boolean);
  } catch (error) {
    console.error('Failed to broadcast admin notification:', error);
    return [];
  }
}

/**
 * Get unread count for an admin
 */
export async function getAdminUnreadCount(adminId: number) {
  try {
    const count = await prisma.adminNotification.count({
      where: {
        adminId,
        read: false,
      },
    });
    return count;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}

/**
 * Mark all notifications as read for an admin
 */
export async function markAllAsRead(adminId: number) {
  try {
    await prisma.adminNotification.updateMany({
      where: {
        adminId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  } catch (error) {
    console.error('Failed to mark all as read:', error);
  }
}

/**
 * Clear old notifications (older than 30 days)
 */
export async function clearOldNotifications() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await prisma.adminNotification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
  } catch (error) {
    console.error('Failed to clear old notifications:', error);
  }
}
