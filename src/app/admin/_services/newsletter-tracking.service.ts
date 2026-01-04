/**
 * Newsletter Tracking Service
 * 
 * Handles newsletter subscription and tracking
 */

import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-service';

/**
 * Track newsletter signup
 */
export async function trackNewsletterSignup(email: string): Promise<void> {
  try {
    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      // Reactivate if unsubscribed
      if (existing.status !== 'active') {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            status: 'active',
            unsubscribedAt: null,
          },
        });
      }
      return;
    }

    // Create new subscription
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        status: 'active',
        subscribedAt: new Date(),
        source: 'web_signup', // Add required 'source' field
      },
    });

    await logActivity(
      0, // System event (no specific user)
      'email_sent',
      { email, timestamp: new Date().toISOString() }
    );

    console.log(`[Newsletter Tracking] ${email} subscribed to newsletter`);
  } catch (error) {
    console.error('[Newsletter Tracking Error]', error);
    throw error;
  }
}

/**
 * Track newsletter unsubscribe
 */
export async function trackNewsletterUnsubscribe(email: string): Promise<void> {
  try {
    await prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    });

    await logActivity(
      0, // System event
      'email_sent',
      { email, type: 'unsubscribe', timestamp: new Date().toISOString() }
    );

    console.log(`[Newsletter Tracking] ${email} unsubscribed from newsletter`);
  } catch (error) {
    console.error('[Newsletter Tracking Error]', error);
    throw error;
  }
}

/**
 * Get newsletter metrics
 */
export async function getNewsletterMetrics(): Promise<{
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribed: number;
}> {
  try {
    const total = await prisma.newsletterSubscriber.count();
    const active = await prisma.newsletterSubscriber.count({
      where: { status: 'active' },
    });
    const unsubscribed = await prisma.newsletterSubscriber.count({
      where: { status: 'unsubscribed' },
    });

    return {
      totalSubscribers: total,
      activeSubscribers: active,
      unsubscribed,
    };
  } catch (error) {
    console.error('[Newsletter Metrics Error]', error);
    throw error;
  }
}

/**
 * Get recent newsletter subscribers
 */
export async function getRecentSubscribers(limit: number = 20) {
  try {
    return await prisma.newsletterSubscriber.findMany({
      take: limit,
      where: { status: 'active' },
      orderBy: { subscribedAt: 'desc' },
      select: {
        email: true,
        subscribedAt: true,
        status: true,
      },
    });
  } catch (error) {
    console.error('[Recent Subscribers Error]', error);
    throw error;
  }
}
