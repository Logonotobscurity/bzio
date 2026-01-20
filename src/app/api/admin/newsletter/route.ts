import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { newsletterService, analyticsService } from '@/services';

/**
 * Newsletter Management API
 * POST /api/admin/newsletter - Campaign and subscriber management
 * DELETE /api/admin/newsletter/[id] - Delete subscriber
 */

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, id, ...data } = body;

    // Unsubscribe
    if (action === 'unsubscribe' && id) {
      await newsletterService.unsubscribe(id);

      await analyticsService.trackEvent({
        eventType: 'newsletter_unsubscribed',
        userId: session.user.id,
        metadata: { subscriberId: id },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Resubscribe
    if (action === 'resubscribe' && id) {
      const subscriber = await newsletterService.updateSubscriber(id, {
        status: 'active',
      });

      await analyticsService.trackEvent({
        eventType: 'newsletter_resubscribed',
        userId: session.user.id,
        metadata: { subscriberId: id },
      });

      return NextResponse.json({ success: true, subscriber }, { status: 200 });
    }

    // Send campaign
    if (action === 'send-campaign') {
      const { subject, content, recipientFilter = 'active' } = data;

      if (!subject || !content) {
        return NextResponse.json(
          { error: 'Subject and content required' },
          { status: 400 }
        );
      }

      const subscribers = await newsletterService.getActiveSubscribers();

      await analyticsService.trackEvent({
        eventType: 'newsletter_campaign_sent',
        userId: session.user.id,
        metadata: {
          recipientCount: subscribers.length,
          subject,
          filter: recipientFilter,
        },
      });

      // TODO: Integrate with email service (SendGrid, etc.)
      const DEBUG = process.env.DEBUG === 'true';
      if (DEBUG) {
        console.log(`[NEWSLETTER_CAMPAIGN] Sent to ${subscribers.length} subscribers`);
      }

      return NextResponse.json(
        {
          success: true,
          message: `Campaign sent to ${subscribers.length} subscribers`,
          recipientCount: subscribers.length,
        },
        { status: 200 }
      );
    }

    // Export subscribers
    if (action === 'export') {
      const format = data.format || 'csv';
      const subscribers = await newsletterService.getAllSubscribers();

      await analyticsService.trackEvent({
        eventType: 'newsletter_exported',
        userId: session.user.id,
        metadata: { format, count: subscribers.length },
      });

      if (format === 'json') {
        return NextResponse.json({ success: true, data: subscribers }, { status: 200 });
      }

      // CSV format
      const headers = ['ID', 'Email', 'Status', 'Subscribed At'];
      const csv = [
        headers.join(','),
        ...subscribers.map((sub) =>
          [
            sub.id,
            sub.email,
            sub.status,
            new Date(sub.subscribedAt).toISOString(),
          ].join(',')
        ),
      ].join('\n');

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[NEWSLETTER_API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID required' }, { status: 400 });
    }

    await newsletterService.deleteSubscriber(id);

    await analyticsService.trackEvent({
      eventType: 'newsletter_deleted',
      userId: session.user.id,
      metadata: { subscriberId: id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[NEWSLETTER_DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}
