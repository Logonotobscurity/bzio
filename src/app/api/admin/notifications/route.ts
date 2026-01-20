import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { AdminNotificationType } from '@prisma/client';

// GET /api/admin/notifications
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = parseInt(session.user.id);

    // Fetch notifications for this admin
    const [notifications, unreadCount] = await Promise.all([
      prisma.admin_notifications.findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.admin_notifications.count({
        where: { adminId, isRead: false },
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
    const { adminId, type, title, message, data } = body;

    if (!adminId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await prisma.admin_notifications.create({
      data: {
        adminId,
        type: type as AdminNotificationType,
        title,
        message,
        data: data || {},
        isRead: false,
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
