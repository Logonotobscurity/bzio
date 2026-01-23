import { prisma } from '@/lib/db';
import { getCachedQuery, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export async function getDashboardStats() {
  return getCachedQuery(
    CACHE_KEYS.dashboard.stats,
    async () => {
      const [
        totalUsers,
        totalQuotes,
        totalProducts,
        pendingQuotes,
      ] = await Promise.all([
        prisma.users.count({ where: { role: 'CUSTOMER' } }),
        prisma.quotes.count(),
        prisma.products.count(),
        prisma.quotes.count({ where: { status: 'PENDING' } }),
      ]);

      return {
        totalUsers,
        totalQuotes,
        totalProducts,
        pendingQuotes,
      };
    },
    CACHE_TTL.dashboard.stats
  );
}

export async function getRecentEvents(limit = 10) {
  return prisma.analytics_events.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      users: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function getAnalyticsSummary(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [eventCounts, topEvents] = await Promise.all([
        prisma.analytics_events.count({
            where: { createdAt: { gte: startDate } }
        }),
        prisma.$queryRaw`SELECT "eventType", COUNT(*) as count FROM analytics_events WHERE "createdAt" >= ${startDate} GROUP BY "eventType" ORDER BY count DESC LIMIT 5`
    ]);

    return {
        totalEvents: eventCounts,
        topEvents: topEvents as any[]
    };
}

export async function getConversionFunnel(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stages = [
        { name: 'Views', type: 'product_viewed' },
        { name: 'Cart', type: 'cart_item_added' },
        { name: 'Checkout', type: 'checkout_started' },
        { name: 'Quotes', type: 'quote_requested' }
    ];

    const funnel = await Promise.all(stages.map(async (stage) => {
        const count = await prisma.analytics_events.count({
            where: {
                eventType: stage.type,
                createdAt: { gte: startDate }
            }
        });
        return { name: stage.name, value: count };
    }));

    return funnel;
}

export async function getAnalyticsEvents(limit = 50, offset = 0) {
    const items = await prisma.analytics_events.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { users: true }
    });
    return items;
}

export async function exportAnalyticsToCSV(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const events = await prisma.analytics_events.findMany({
        where: { createdAt: { gte: startDate } },
        include: { users: true }
    });

    const headers = ['ID', 'Type', 'User', 'Date', 'Data'];
    const rows = events.map(e => [
        String(e.id),
        e.eventType,
        e.users?.email || 'System',
        e.createdAt.toISOString(),
        JSON.stringify(e.eventData)
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
