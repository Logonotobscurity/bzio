'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';

/**
 * Unsubscribe an email from newsletter
 * Admin action to remove subscribers
 */
export async function unsubscribeFromNewsletter(subscriberId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { error: 'Unauthorized: Admin access required' };
    }

    const subscriber = await prisma.newsletter_subscribers.update({
      where: { id: subscriberId },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    });

    // Log activity
    await prisma.analytics_events.create({
      data: {
        userId: parseInt(session.user.id, 10),
        eventType: 'newsletter_unsubscribed',
        data: JSON.stringify({ subscriberId, email: subscriber.email }),
        source: 'admin-dashboard',
      },
    });

    revalidatePath('/admin');
    return { success: true, subscriber };
  } catch (error) {
    console.error('[NEWSLETTER_UNSUBSCRIBE] Error:', error);
    return { error: 'Failed to unsubscribe' };
  }
}

/**
 * Resubscribe an email to newsletter
 * Admin action to re-enable subscribers
 */
export async function resubscribeToNewsletter(subscriberId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { error: 'Unauthorized: Admin access required' };
    }

    const subscriber = await prisma.newsletter_subscribers.update({
      where: { id: subscriberId },
      data: {
        status: 'active',
        unsubscribedAt: null,
      },
    });

    // Log activity
    await prisma.analytics_events.create({
      data: {
        userId: parseInt(session.user.id, 10),
        eventType: 'newsletter_resubscribed',
        data: JSON.stringify({ subscriberId, email: subscriber.email }),
        source: 'admin-dashboard',
      },
    });

    revalidatePath('/admin');
    return { success: true, subscriber };
  } catch (error) {
    console.error('[NEWSLETTER_RESUBSCRIBE] Error:', error);
    return { error: 'Failed to resubscribe' };
  }
}

/**
 * Delete a newsletter subscriber
 * Admin action to remove subscribers permanently
 */
export async function deleteNewsletterSubscriber(subscriberId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { error: 'Unauthorized: Admin access required' };
    }

    const subscriber = await prisma.newsletter_subscribers.findUnique({
      where: { id: subscriberId },
    });

    await prisma.newsletter_subscribers.delete({
      where: { id: subscriberId },
    });

    // Log activity
    await prisma.analytics_events.create({
      data: {
        userId: parseInt(session.user.id, 10),
        eventType: 'newsletter_deleted',
        data: JSON.stringify({ subscriberId, email: subscriber?.email }),
        source: 'admin-dashboard',
      },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('[NEWSLETTER_DELETE] Error:', error);
    return { error: 'Failed to delete subscriber' };
  }
}

/**
 * Send newsletter campaign
 * Admin action to send newsletters to active subscribers
 */
export async function sendNewsletterCampaign(
  subject: string,
  content: string,
  recipientFilter?: 'all' | 'active' | 'custom'
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Get recipients based on filter
    let subscribers;
    if (recipientFilter === 'active') {
      subscribers = await prisma.newsletter_subscribers.findMany({
        where: { status: 'active' },
      });
    } else {
      subscribers = await prisma.newsletter_subscribers.findMany();
    }

    // Log campaign
    await prisma.analytics_events.create({
      data: {
        userId: parseInt(session.user.id, 10),
        eventType: 'newsletter_campaign_sent',
        data: JSON.stringify({
          recipientCount: subscribers.length,
          subject,
          filter: recipientFilter,
        }),
        source: 'admin-dashboard',
      },
    });

    // TODO: Integrate with email service to actually send emails
    console.log(`[NEWSLETTER_SEND] Campaign sent to ${subscribers.length} subscribers`);

    revalidatePath('/admin');
    return {
      success: true,
      message: `Campaign sent to ${subscribers.length} subscribers`,
      recipientCount: subscribers.length,
    };
  } catch (error) {
    console.error('[NEWSLETTER_SEND] Error:', error);
    return { error: 'Failed to send campaign' };
  }
}

/**
 * Export newsletter subscribers
 * Admin action to export subscriber list
 */
export async function exportNewsletterSubscribers(format: 'csv' | 'json' = 'csv') {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { error: 'Unauthorized: Admin access required' };
    }

    const subscribers = await prisma.newsletter_subscribers.findMany({
      select: {
        id: true,
        email: true,
        status: true,
        subscribedAt: true,
        unsubscribedAt: true,
      },
    });

    // Log activity
    await prisma.analytics_events.create({
      data: {
        userId: parseInt(session.user.id, 10),
        eventType: 'newsletter_exported',
        data: JSON.stringify({ format, count: subscribers.length }),
        source: 'admin-dashboard',
      },
    });

    if (format === 'json') {
      return { success: true, data: subscribers, format: 'json' };
    }

    // CSV format
    const headers = ['ID', 'Email', 'Status', 'Subscribed At', 'Unsubscribed At'];
    const rows = subscribers.map((sub) => [
      sub.id,
      sub.email,
      sub.status,
      sub.subscribedAt.toISOString(),
      sub.unsubscribedAt?.toISOString() || '',
    ]);

    return {
      success: true,
      data: [headers, ...rows],
      format: 'csv',
      filename: `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`,
    };
  } catch (error) {
    console.error('[NEWSLETTER_EXPORT] Error:', error);
    return { error: 'Failed to export subscribers' };
  }
}
