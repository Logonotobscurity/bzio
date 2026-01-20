"use server";

import { prisma } from '@/lib/prisma';
import { getCachedQuery, CACHE_TTL } from '@/lib/cache';

export interface AnalyticsFilters {
  dateFrom?: Date;
  dateTo?: Date;
  eventType?: string;
}

export interface DailyMetric {
  date: string;
  count: number;
}

export interface EventTypeMetric {
  type: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalEvents: number;
  uniqueUsers: number;
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  topEventTypes: EventTypeMetric[];
  dailyTrend: DailyMetric[];
  hourlyDistribution: { hour: number; count: number }[];
}

/**
 * Get comprehensive analytics summary
 */
export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  return getCachedQuery(
    `analytics:summary:${days}`,
    async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalEvents,
        uniqueUsersResult,
        eventsToday,
        eventsThisWeek,
        eventsThisMonth,
        eventsByType,
        dailyEvents,
      ] = await Promise.all([
        prisma.analytics_events.count({ where: { createdAt: { gte: startDate } } }),
        prisma.analytics_events.groupBy({
          by: ['userId'],
          where: { createdAt: { gte: startDate }, userId: { not: null } },
        }),
        prisma.analytics_events.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.analytics_events.count({ where: { createdAt: { gte: startOfWeek } } }),
        prisma.analytics_events.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.analytics_events.groupBy({
          by: ['eventType'],
          where: { createdAt: { gte: startDate } },
          _count: { eventType: true },
          orderBy: { _count: { eventType: 'desc' } },
          take: 10,
        }),
        prisma.$queryRaw<{ date: Date; count: bigint }[]>`
          SELECT DATE("createdAt") as date, COUNT(*) as count
          FROM analytics_events
          WHERE "createdAt" >= ${startDate}
          GROUP BY DATE("createdAt")
          ORDER BY date ASC
        `,
      ]);

      const topEventTypes: EventTypeMetric[] = eventsByType.map((e) => ({
        type: e.eventType,
        count: e._count.eventType,
        percentage: totalEvents > 0 ? (e._count.eventType / totalEvents) * 100 : 0,
      }));

      const dailyTrend: DailyMetric[] = dailyEvents.map((d) => ({
        date: new Date(d.date).toISOString().split('T')[0],
        count: Number(d.count),
      }));

      // Generate hourly distribution (mock for now, would need raw query)
      const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: Math.floor(Math.random() * 100) + 10,
      }));

      return {
        totalEvents,
        uniqueUsers: uniqueUsersResult.length,
        eventsToday,
        eventsThisWeek,
        eventsThisMonth,
        topEventTypes,
        dailyTrend,
        hourlyDistribution,
      };
    },
    { ttl: CACHE_TTL.MEDIUM }
  );
}

/**
 * Get events with filters
 */
export async function getAnalyticsEvents(filters: AnalyticsFilters = {}, page = 1, limit = 50) {
  const where: Record<string, unknown> = {};

  if (filters.eventType && filters.eventType !== 'all') {
    where.eventType = filters.eventType;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) (where.createdAt as Record<string, Date>).gte = filters.dateFrom;
    if (filters.dateTo) (where.createdAt as Record<string, Date>).lte = filters.dateTo;
  }

  const [events, total] = await Promise.all([
    prisma.analytics_events.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    }),
    prisma.analytics_events.count({ where }),
  ]);

  return {
    events: events.map((e) => ({
      id: e.id.toString(),
      eventType: e.eventType,
      eventData: e.eventData as Record<string, unknown>,
      user: e.user,
      createdAt: e.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [productViews, quoteRequests, checkouts] = await Promise.all([
    prisma.analytics_events.count({ where: { eventType: 'product_viewed', createdAt: { gte: startDate } } }),
    prisma.analytics_events.count({ where: { eventType: 'quote_requested', createdAt: { gte: startDate } } }),
    prisma.analytics_events.count({ where: { eventType: 'checkout_completed', createdAt: { gte: startDate } } }),
  ]);

  return {
    steps: [
      { name: 'Product Views', count: productViews, percentage: 100 },
      { name: 'Quote Requests', count: quoteRequests, percentage: productViews > 0 ? (quoteRequests / productViews) * 100 : 0 },
      { name: 'Checkouts', count: checkouts, percentage: productViews > 0 ? (checkouts / productViews) * 100 : 0 },
    ],
  };
}

/**
 * Export analytics to CSV
 */
export async function exportAnalyticsToCSV(filters: AnalyticsFilters = {}): Promise<string> {
  const { events } = await getAnalyticsEvents(filters, 1, 10000);
  
  const headers = ['ID', 'Event Type', 'User Email', 'Created At', 'Data'];
  const rows = events.map((e) => [
    e.id,
    e.eventType,
    e.user?.email || 'Anonymous',
    new Date(e.createdAt).toISOString(),
    JSON.stringify(e.eventData || {}),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
