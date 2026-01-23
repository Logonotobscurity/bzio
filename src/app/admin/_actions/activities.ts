/**
 * Admin Dashboard Activities & Data Fetching
 */

import { prisma } from '@/lib/db';
import { getCachedQuery, CACHE_TTL } from '@/lib/cache';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface ActivityEvent {
  id: string;
  type: string;
  timestamp: Date;
  actor: {
    id?: string;
    email: string;
    name?: string;
  };
  data: any;
  status: string;
}

export async function getRecentActivities(
  offset: number = 0,
  limit: number = 20
): Promise<PaginatedResult<ActivityEvent>> {
  return getCachedQuery(
    `dashboard:activities:${offset}:${limit}`,
    async () => {
        const events = await prisma.analytics_events.findMany({
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
            include: {
                users: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        const total = await prisma.analytics_events.count();

        const data: ActivityEvent[] = events.map(event => ({
            id: String(event.id),
            type: event.eventType,
            timestamp: event.createdAt,
            actor: {
                id: String(event.userId),
                email: event.users?.email || 'System',
                name: `${event.users?.firstName || ''} ${event.users?.lastName || ''}`.trim() || 'System'
            },
            data: event.eventData,
            status: 'active'
        }));

        return {
            data,
            total,
            offset,
            limit,
            hasMore: offset + limit < total
        };
    },
    CACHE_TTL.dashboard.realtime
  );
}

export async function getActivityStats() {
    const [
      totalUsers,
      newUsersThisWeek,
      totalQuotes,
      pendingQuotes,
      totalNewsletterSubscribers,
      totalFormSubmissions,
      totalCheckouts,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      }),
      prisma.quotes.count(),
      prisma.quotes.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.newsletter_subscribers.count(),
      prisma.form_submissions.count(),
      prisma.analytics_events.count({
        where: { eventType: 'checkout_completed' },
      }),
    ]);

    return {
      totalUsers,
      newUsersThisWeek,
      totalQuotes,
      pendingQuotes,
      totalNewsletterSubscribers,
      totalFormSubmissions,
      totalCheckouts,
    };
}

export async function getQuotes(offset: number = 0, limit: number = 20) {
    const items = await prisma.quotes.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { users: true, quote_lines: true }
    });
    const total = await prisma.quotes.count();
    return { data: items, total, offset, limit, hasMore: offset + limit < total };
}

export async function getNewUsers(limit: number = 20) {
    const items = await prisma.users.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: { role: 'CUSTOMER' }
    });
    return { data: items, total: items.length, offset: 0, limit, hasMore: false };
}

export async function getNewsletterSubscribers(limit: number = 20) {
    const items = await prisma.newsletter_subscribers.findMany({
        take: limit,
        orderBy: { subscribedAt: 'desc' }
    });
    return { data: items, total: items.length, offset: 0, limit, hasMore: false };
}

export async function getFormSubmissions(limit: number = 20) {
    const items = await prisma.form_submissions.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' }
    });
    return { data: items, total: items.length, offset: 0, limit, hasMore: false };
}
