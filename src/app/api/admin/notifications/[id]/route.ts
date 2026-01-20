import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/db';

// PATCH /api/admin/notifications/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = Number(session.user.id);
    const { id } = await params;
    const notificationId = parseInt(id);

    // Verify notification belongs to this admin
    const notification = await prisma.admin_notifications.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.adminId !== adminId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const { isRead } = body;

    const updated = await prisma.admin_notifications.update({
      where: { id: notificationId },
      data: { isRead: isRead !== undefined ? isRead : notification.isRead },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/notifications/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = Number(session.user.id);
    const { id } = await params;
    const notificationId = parseInt(id);

    // Verify notification belongs to this admin
    const notification = await prisma.admin_notifications.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.adminId !== adminId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.admin_notifications.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
