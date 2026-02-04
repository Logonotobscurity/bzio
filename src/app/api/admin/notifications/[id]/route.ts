import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { adminNotificationService } from '@/services';
import { successResponse, unauthorized, notFound, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

// PATCH /api/admin/notifications/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/notifications/[id]')
    .withMethod('PATCH')
    .withRequestId(requestId);

  try {
    const session = await getServerSession();

    if (!session || session.user?.role !== 'admin') {
      errorLogger.warn('Unauthorized notification update', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const adminId = Number(session.user.id);
    const { id } = await params;
    const notificationId = id;

    // Verify notification belongs to this admin
    const notification = await adminNotificationService.getNotificationById(notificationId);

    if (!notification || notification.adminId !== adminId) {
      errorLogger.warn(`Notification not found: ${notificationId}`, context.withUserId(adminId).build());
      return notFound('Notification not found');
    }

    const body = await request.json();
    const { read } = body;

    const updated = await adminNotificationService.updateNotification(notificationId, {
      read: read !== undefined ? read : notification.read,
    });

    errorLogger.info(
      `Notification ${notificationId} updated`,
      context.withUserId(adminId).build()
    );

    return successResponse(updated, 200);
  } catch (error) {
    errorLogger.error(
      'Error updating notification',
      error,
      context.build()
    );
    return internalServerError('Failed to update notification');
  }
}

// DELETE /api/admin/notifications/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/notifications/[id]')
    .withMethod('DELETE')
    .withRequestId(requestId);

  try {
    const session = await getServerSession();

    if (!session || session.user?.role !== 'admin') {
      errorLogger.warn('Unauthorized notification delete', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const adminId = Number(session.user.id);
    const { id } = await params;
    const notificationId = id;

    // Verify notification belongs to this admin
    const notification = await adminNotificationService.getNotificationById(notificationId);

    if (!notification || notification.adminId !== adminId) {
      errorLogger.warn(`Notification not found: ${notificationId}`, context.withUserId(adminId).build());
      return notFound('Notification not found');
    }

    await adminNotificationService.deleteNotification(notificationId);

    errorLogger.info(
      `Notification ${notificationId} deleted`,
      context.withUserId(adminId).build()
    );

    return successResponse({ success: true }, 200);
  } catch (error) {
    errorLogger.error(
      'Error deleting notification',
      error,
      context.build()
    );
    return internalServerError('Failed to delete notification');
  }
}
