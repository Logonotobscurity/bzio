import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';

// PATCH /api/admin/notifications/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = Number(session.user.id);
    const { id } = await params;
    const notificationId = id;

    // Verify notification belongs to this admin
    const notification = await prisma.adminNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.adminId !== adminId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const { read } = body;

    const updated = await prisma.adminNotification.update({
      where: { id: notificationId },
      data: { read: read !== undefined ? read : notification.read },
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
    const session = await getServerSession();

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = Number(session.user.id);
    const { id } = await params;
    const notificationId = id;

    // Verify notification belongs to this admin
    const notification = await prisma.adminNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.adminId !== adminId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.adminNotification.delete({
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
