import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/auth';
import { prisma } from '@/lib/db';

// GET /api/admin/notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = session.user.id;

    // Fetch notifications for this admin
    const [notifications, unreadCount] = await Promise.all([
      prisma.adminNotification.findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.adminNotification.count({
        where: { adminId, read: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/admin/notifications (create notification)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Allow internal requests for creating notifications
    if (!session && request.headers.get('X-Internal-Secret') !== process.env.INTERNAL_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { adminId, type, title, message, data, actionUrl } = body;

    if (!adminId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await prisma.adminNotification.create({
      data: {
        adminId,
        type,
        title,
        message,
        data: data || {},
        actionUrl: actionUrl || null,
        read: false,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
