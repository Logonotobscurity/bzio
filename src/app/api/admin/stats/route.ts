import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();

    const [totalUsers, totalQuotes, totalProducts, recentActivities] = await Promise.all([
      prisma.users.count({ where: { role: 'CUSTOMER' } }),
      prisma.quotes.count(),
      prisma.products.count(),
      prisma.analytics_events.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          eventType: true,
          createdAt: true,
          users: {
            select: { firstName: true, lastName: true }
          }
        }
      })
    ]);

    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      type: activity.eventType,
      description: `${activity.user?.firstName || 'User'} ${activity.eventType}`}));

    return NextResponse.json({
      totalUsers,
      totalQuotes,
      totalProducts,
      recentActivities: formattedActivities
    });

  } catch (error) {
    console.error('[ADMIN_STATS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}