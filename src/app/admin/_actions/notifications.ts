import { prisma } from '@/lib/db';
import { AdminNotificationType } from '@prisma/client';

export interface NotificationPayload {
  adminId: number;
  type: AdminNotificationType;
  title: string;
  message: string;
  data?: Record<string, string | number | boolean | null>;
}

/**
 * Create a notification for an admin
 * Can be called from API routes or server actions
 */
export async function createAdminNotification(payload: NotificationPayload) {
  try {
    const notification = await prisma.admin_notifications.create({
      data: {
        adminId: payload.adminId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data || {},
        isRead: false,
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
  type: AdminNotificationType,
  title: string,
  message: string,
  data?: Record<string, string | number | boolean | null>
) {
  try {
    // Get all admins
    const admins = await prisma.users.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    // Create notification for each admin
    const notifications = await Promise.all(
      admins.map((admin) =>
        createAdminNotification({
          adminId: admin.id,
          type,
          title,
          message,
          data,
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
    const count = await prisma.admin_notifications.count({
      where: {
        adminId,
        isRead: false,
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
    await prisma.admin_notifications.updateMany({
      where: {
        adminId,
        isRead: false,
      },
      data: {
        isRead: true,
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

    await prisma.admin_notifications.deleteMany({
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
