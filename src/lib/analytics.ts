/**
 * Analytics Tracking Utility
 * Provides fire-and-forget analytics event tracking
 * Errors are silently logged and don't break user experience
 */

import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';

export type EventType =
  | 'PRODUCT_VIEW'
  | 'SEARCH'
  | 'CART_ABANDONED'
  | 'CART_CHECKOUT'
  | 'PURCHASE'
  | 'PAGE_VIEW'
  | 'FORM_SUBMIT'
  | 'CUSTOM';

interface TrackEventOptions {
  eventType: EventType;
  userId?: number | null;
  sessionId?: string;
  data: Record<string, any>;
  source?: string;
}

/**
 * Track a custom analytics event
 * Non-blocking, errors are silently caught
 * Skips if database connection is not available
 */
export async function trackEvent(
  eventType: string,
  userId: number | null | undefined,
  data: Record<string, any>,
  sessionId?: string
): Promise<void> {
  try {
    const finalSessionId = sessionId || generateSessionId();

    // Use a timeout to avoid hanging if database is unavailable
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Analytics timeout')), 3000)
    );

    const trackPromise = prisma.analyticsEvent.create({
      data: {
        eventType,
        userId: userId || null,
        sessionId: finalSessionId,
        timestamp: new Date(),
        data,
        source: 'B2B_PLATFORM',
      },
    });

    await Promise.race([trackPromise, timeoutPromise]);
  } catch (error) {
    // Silently log errors - analytics should never break user experience
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Analytics tracking skipped (${eventType}): ${errorMessage}`);
    }
  }
}

/**
 * Track product view event
 */
export async function trackProductView(
  productId: string | number,
  userId: number | null | undefined,
  metadata?: Record<string, any>,
  sessionId?: string
): Promise<void> {
  return trackEvent(
    'PRODUCT_VIEW',
    userId,
    {
      productId: String(productId),
      ...metadata,
      viewedAt: new Date().toISOString(),
    },
    sessionId
  );
}

/**
 * Track search event
 */
export async function trackSearch(
  query: string,
  userId: number | null | undefined,
  resultsCount: number = 0,
  sessionId?: string
): Promise<void> {
  return trackEvent(
    'SEARCH',
    userId,
    {
      query,
      resultsCount,
      searchedAt: new Date().toISOString(),
    },
    sessionId
  );
}

/**
 * Track cart abandonment event
 */
export async function trackCartAbandonment(
  userId: number | null | undefined,
  cartItems: Array<{ id: string; quantity: number; price?: number }>,
  totalValue?: number,
  sessionId?: string
): Promise<void> {
  return trackEvent(
    'CART_ABANDONED',
    userId,
    {
      itemCount: cartItems.length,
      items: cartItems,
      totalValue,
      abandonedAt: new Date().toISOString(),
    },
    sessionId
  );
}

/**
 * Track page view event
 */
export async function trackPageView(
  pageUrl: string,
  userId: number | null | undefined,
  pageTitle?: string,
  sessionId?: string
): Promise<void> {
  return trackEvent(
    'PAGE_VIEW',
    userId,
    {
      pageUrl,
      pageTitle,
      viewedAt: new Date().toISOString(),
    },
    sessionId
  );
}

/**
 * Track form submission event
 */
export async function trackFormSubmit(
  formType: string,
  userId: number | null | undefined,
  metadata?: Record<string, any>,
  sessionId?: string
): Promise<void> {
  return trackEvent(
    'FORM_SUBMIT',
    userId,
    {
      formType,
      ...metadata,
      submittedAt: new Date().toISOString(),
    },
    sessionId
  );
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return randomUUID();
}

/**
 * Get or generate session ID from various sources
 */
export function getOrGenerateSessionId(providedSessionId?: string): string {
  return providedSessionId || generateSessionId();
}

// Retrieval methods (moved from AnalyticsService)

export async function getEvents(limit?: number, skip?: number) {
  return prisma.analyticsEvent.findMany({
    take: limit,
    skip,
    orderBy: { timestamp: 'desc' },
  });
}

export async function getEventById(id: string | number) {
  return prisma.analyticsEvent.findUnique({
    where: { id: String(id) },
  });
}

export async function getEventsByType(eventType: string) {
  return prisma.analyticsEvent.findMany({
    where: { eventType },
    orderBy: { timestamp: 'desc' },
  });
}

export async function getEventsByUser(userId: number) {
  return prisma.analyticsEvent.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
  });
}

export async function getEventTypeStats(eventType: string) {
  return prisma.analyticsEvent.count({
    where: { eventType },
  });
}

export async function getUserActivityStats(userId: number) {
  return prisma.analyticsEvent.count({
    where: { userId },
  });
}

export async function getEventCount() {
  return prisma.analyticsEvent.count();
}

export async function deleteEvent(id: string | number) {
  try {
    await prisma.analyticsEvent.delete({
      where: { id: String(id) },
    });
    return true;
  } catch {
    return false;
  }
}

export async function getPopularEvents(limit: number = 10) {
  const result = await prisma.analyticsEvent.groupBy({
    by: ['eventType'],
    _count: {
      eventType: true,
    },
    orderBy: {
      _count: {
        eventType: 'desc',
      },
    },
    take: limit,
  });

  return result.map(item => ({
    type: item.eventType,
    count: item._count.eventType,
  }));
}

export async function getActiveUsers(limit: number = 10) {
  const result = await prisma.analyticsEvent.groupBy({
    by: ['userId'],
    where: {
      userId: { not: null },
    },
    _count: {
      userId: true,
    },
    orderBy: {
      _count: {
        userId: 'desc',
      },
    },
    take: limit,
  });

  return result.map(item => ({
    userId: item.userId as number,
    eventCount: item._count.userId,
  }));
}
