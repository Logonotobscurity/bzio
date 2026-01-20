"use server";

import { prisma } from '@/lib/prisma';
import { getCachedQuery, CACHE_TTL } from '@/lib/cache';
import type { 
  UserDashboardData, 
  UserAccountDetails, 
  UserStats, 
  UserActivityItem,
  ActivityType 
} from '../_types/dashboard';

/**
 * Fetch all dashboard data in a single optimized query batch
 */
export async function getUserDashboardData(userId: number): Promise<UserDashboardData> {
  return getCachedQuery(
    `user:dashboard:${userId}`,
    () => fetchDashboardData(userId),
    { ttl: CACHE_TTL.SHORT }
  );
}

async function fetchDashboardData(userId: number): Promise<UserDashboardData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    user,
    totalQuotes,
    quotesThisMonth,
    totalCheckouts,
    checkoutsThisMonth,
    totalEvents,
    eventsToday,
    recentEvents,
  ] = await Promise.all([
    // User profile with company
    prisma.users.findUnique({
      where: { id: userId },
      include: { companies: { select: { name: true } } },
    }),

    // Quote stats
    prisma.quotes.count({ where: { userId } }),
    prisma.quotes.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    }),

    // Checkout stats (from AnalyticsEvent)
    prisma.analytics_events.count({
      where: { userId, eventType: 'checkout_completed' },
    }),
    prisma.analytics_events.count({
      where: {
        userId,
        eventType: 'checkout_completed',
        createdAt: { gte: startOfMonth },
      },
    }),

    // Total activity stats
    prisma.analytics_events.count({ where: { userId } }),
    prisma.analytics_events.count({
      where: { userId, createdAt: { gte: startOfToday } },
    }),

    // Recent activity (last 10 events)
    prisma.analytics_events.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  const userDetails: UserAccountDetails = {
    id: user.id.toString(),
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
    email: user.email,
    company: user.company?.name || null,
    role: user.role as 'CUSTOMER' | 'ADMIN',
    status: user.isActive ? 'active' : 'inactive',
    lastLoginAt: user.lastLogin,
    emailVerified: !!user.emailVerified,
    createdAt: user.createdAt,
  };

  const stats: UserStats = {
    quoteRequests: {
      status: 'live',
      total: totalQuotes,
      change: quotesThisMonth,
      changePeriod: 'this month',
    },
    checkouts: {
      status: 'active',
      total: totalCheckouts,
      change: checkoutsThisMonth,
      changePeriod: 'this month',
    },
    totalActivity: {
      status: 'track',
      total: totalEvents,
      change: eventsToday,
      changePeriod: 'new today',
    },
  };

  const recentActivity: UserActivityItem[] = recentEvents.map((event) => ({
    id: event.id.toString(),
    type: event.eventType as ActivityType,
    description: formatActivityDescription(event.eventType, event.eventData),
    metadata: event.eventData as Record<string, unknown> | undefined,
  }));

  return {
    user: userDetails,
    stats,
    recentActivity,
  };
}

function formatActivityDescription(type: string, data: unknown): string {
  const eventData = data as Record<string, unknown> | null;

  switch (type) {
    // Existing events
    case 'quote_requested':
      return `Requested quote ${eventData?.reference || ''}`;
    case 'checkout_completed':
      return `Completed checkout for ₦${eventData?.totalAmount || 0}`;
    case 'form_submitted':
      return `Submitted ${eventData?.formType || 'form'}`;
    case 'product_viewed':
      return `Viewed product ${eventData?.productName || eventData?.sku || ''}`;
    case 'search_performed':
      return `Searched for "${eventData?.query || ''}"`;
    case 'newsletter_signup':
      return 'Subscribed to newsletter';
    case 'user_registered':
      return 'Account created';
    
    // Settings events
    case 'profile_updated':
      return 'Updated profile information';
    case 'address_created':
      return `Added new ${(eventData?.type as string)?.toLowerCase() || ''} address`;
    case 'address_updated':
      return 'Updated address';
    case 'address_deleted':
      return 'Removed an address';
    case 'company_updated':
      return 'Updated company information';
    case 'password_changed':
      return 'Changed account password';
    case 'notification_read':
      return 'Marked notification as read';
    case 'notification_preferences_updated':
      return 'Updated notification preferences';
    
    default:
      return type.replace(/_/g, ' ');
  }
}

/**
 * Get user's recent quotes
 */
export async function getUserQuotes(userId: number, limit: number = 5) {
  const quotes = await prisma.quotes.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      quote_lines: {
        include: {
          product: { select: { name: true, sku: true } },
        },
      },
    },
  });

  return quotes.map((quote) => ({
    id: quote.id.toString(),
    reference: quote.reference,
    status: quote.status,
    totalAmount: parseFloat(quote.totalAmount.toString()),
    itemCount: quote.quoteLines.length,
    createdAt: quote.createdAt,
  }));
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(userId: number, limit: number = 10) {
  const notifications = await prisma.notifications.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return notifications.map((notif) => ({
    id: notif.id.toString(),
    title: notif.title,
    message: notif.message,
    type: notif.type,
    isRead: notif.isRead,
    createdAt: notif.createdAt,
  }));
}
