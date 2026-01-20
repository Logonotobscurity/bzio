"use server";

import { prisma } from '@/lib/prisma';
import { cachedQuery, CACHE_TTL, CACHE_KEYS, invalidateCacheByPrefix } from '@/lib/cache';

export interface NewsletterFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NewsletterStats {
  total: number;
  active: number;
  inactive: number;
  newThisWeek: number;
  newThisMonth: number;
}

/**
 * Get newsletter statistics with caching
 */
export async function getNewsletterStats(): Promise<NewsletterStats> {
  return cachedQuery(
    `${CACHE_KEYS.NEWSLETTER_SUBSCRIBERS}:stats`,
    async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

      const [total, active, inactive, newThisWeek, newThisMonth] = await Promise.all([
        prisma.newsletter_subscribers.count(),
        prisma.newsletter_subscribers.count({ where: { isActive: true } }),
        prisma.newsletter_subscribers.count({ where: { isActive: false } }),
        prisma.newsletter_subscribers.count({ where: { subscribedAt: { gte: weekAgo } } }),
        prisma.newsletter_subscribers.count({ where: { subscribedAt: { gte: monthAgo } } }),
      ]);

      return { total, active, inactive, newThisWeek, newThisMonth };
    },
    { ttl: CACHE_TTL.SHORT }
  );
}

/**
 * Get subscribers with filters and pagination
 */
export async function getSubscribers(filters: NewsletterFilters = {}, page = 1, limit = 20) {
  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.status === 'active') {
    where.isActive = true;
  } else if (filters.status === 'inactive') {
    where.isActive = false;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.subscribedAt = {};
    if (filters.dateFrom) (where.subscribedAt as Record<string, Date>).gte = filters.dateFrom;
    if (filters.dateTo) (where.subscribedAt as Record<string, Date>).lte = filters.dateTo;
  }

  const [subscribers, total] = await Promise.all([
    prisma.newsletter_subscribers.findMany({
      where,
      orderBy: { subscribedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.newsletter_subscribers.count({ where }),
  ]);

  return {
    subscribers: subscribers.map((sub) => ({
      id: sub.id.toString(),
      email: sub.email,
      firstName: sub.firstName,
      lastName: sub.lastName,
      isActive: sub.isActive,
      subscribedAt: sub.subscribedAt,
      unsubscribedAt: sub.unsubscribedAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Unsubscribe a subscriber
 */
export async function unsubscribeEmail(subscriberId: number) {
  const subscriber = await prisma.newsletter_subscribers.update({
    where: { id: subscriberId },
    data: { isActive: false, unsubscribedAt: new Date() , updatedAt: new Date()},
  });
  await invalidateCacheByPrefix(CACHE_KEYS.NEWSLETTER_SUBSCRIBERS);
  return subscriber;
}

/**
 * Resubscribe a subscriber
 */
export async function resubscribeEmail(subscriberId: number) {
  const subscriber = await prisma.newsletter_subscribers.update({
    where: { id: subscriberId },
    data: { isActive: true, unsubscribedAt: null , updatedAt: new Date()},
  });
  await invalidateCacheByPrefix(CACHE_KEYS.NEWSLETTER_SUBSCRIBERS);
  return subscriber;
}

/**
 * Delete a subscriber
 */
export async function deleteSubscriber(subscriberId: number) {
  await prisma.newsletter_subscribers.delete({ where: { id: subscriberId } });
  await invalidateCacheByPrefix(CACHE_KEYS.NEWSLETTER_SUBSCRIBERS);
}

/**
 * Export subscribers to CSV
 */
export async function exportSubscribersToCSV(filters: NewsletterFilters = {}): Promise<string> {
  const { subscribers } = await getSubscribers(filters, 1, 10000);
  
  const headers = ['Email', 'First Name', 'Last Name', 'Status', 'Subscribed At', 'Unsubscribed At'];
  const rows = subscribers.map((sub) => [
    sub.email,
    sub.firstName || '',
    sub.lastName || '',
    sub.isActive ? 'Active' : 'Inactive',
    new Date(sub.subscribedAt).toISOString(),
    sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toISOString() : '',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
