import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/auth';
import { adminNotificationService } from '@/services';
import { successResponse, unauthorized, badRequest, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

// GET /api/admin/notifications
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/notifications')
    .withMethod('GET')
    .withRequestId(requestId);

  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      errorLogger.warn('Unauthorized notifications access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const adminId = Number(session.user.id);

    // Fetch notifications for this admin
    const [notifications, unreadCount] = await Promise.all([
      adminNotificationService.getAdminNotifications(adminId, 50),
      adminNotificationService.getUnreadCount(adminId),
    ]);

    errorLogger.info(
      `Fetched ${notifications.length} notifications`,
      context.withUserId(adminId).build()
    );

    return successResponse({
      notifications,
      unreadCount,
    }, 200);
  } catch (error) {
    errorLogger.error(
      'Error fetching notifications',
      error,
      context.build()
    );
    return internalServerError('Failed to fetch notifications');
  }
}

// POST /api/admin/notifications (create notification)
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/notifications')
    .withMethod('POST')
    .withRequestId(requestId);

  try {
    const session = await auth();

    // Allow internal requests for creating notifications
    if (!session && request.headers.get('X-Internal-Secret') !== process.env.INTERNAL_SECRET) {
      errorLogger.warn('Unauthorized notification creation', context.build());
      return unauthorized();
    }

    const body = await request.json();
    const { adminId, type, title, message, data, actionUrl } = body;

    if (!adminId || !type || !title || !message) {
      return badRequest('adminId, type, title, and message are required');
    }

    const notification = await adminNotificationService.createNotification({
      adminId: Number(adminId),
      type,
      title,
      message,
      actionUrl,
      data: data || {},
    });

    errorLogger.info(
      `Notification created (type: ${type})`,
      context.withUserId(adminId).build()
    );

    return successResponse(notification, 201);
  } catch (error) {
    errorLogger.error(
      'Error creating notification',
      error,
      context.build()
    );
    return internalServerError('Failed to create notification');
  }
}
