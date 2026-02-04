import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { newsletterService } from '@/services';
import { trackEvent } from '@/lib/analytics';
import { successResponse, unauthorized, badRequest, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

/**
 * Newsletter Management API
 * POST /api/admin/newsletter - Campaign and subscriber management
 * DELETE /api/admin/newsletter/[id] - Delete subscriber
 */

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/newsletter')
    .withMethod('POST')
    .withRequestId(requestId);

  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      errorLogger.warn('Unauthorized newsletter API access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const body = await request.json();
    const { action, id, ...data } = body;

    if (!action) {
      return badRequest('Action is required');
    }

    // Unsubscribe
    if (action === 'unsubscribe' && id) {
      await newsletterService.unsubscribe(id);

      await trackEvent('newsletter_unsubscribed', session.user.id, {
        subscriberId: id,
      });

      errorLogger.info(`Subscriber ${id} unsubscribed`, context.withUserId(session.user.id).build());
      return successResponse({ success: true }, 200);
    }

    // Resubscribe
    if (action === 'resubscribe' && id) {
      const subscriber = await newsletterService.updateSubscriber(id, {
        status: 'active',
      });

      await trackEvent('newsletter_resubscribed', session.user.id, {
        subscriberId: id,
      });

      errorLogger.info(`Subscriber ${id} resubscribed`, context.withUserId(session.user.id).build());
      return successResponse({ success: true, subscriber }, 200);
    }

    // Send campaign
    if (action === 'send-campaign') {
      const { subject, content, recipientFilter = 'active' } = data;

      if (!subject || !content) {
        return badRequest('Subject and content are required');
      }

      const subscribers = await newsletterService.getActiveSubscribers();

      await trackEvent('newsletter_campaign_sent', session.user.id, {
        recipientCount: subscribers.length,
        subject,
        filter: recipientFilter,
      });

      // TODO: Integrate with email service (SendGrid, etc.)
      const DEBUG = process.env.DEBUG === 'true';
      if (DEBUG) {
        errorLogger.info(
          `Campaign sent to ${subscribers.length} subscribers`,
          context.withUserId(session.user.id).build()
        );
      }

      return successResponse(
        {
          success: true,
          message: `Campaign sent to ${subscribers.length} subscribers`,
          recipientCount: subscribers.length,
        },
        200
      );
    }

    // Export subscribers
    if (action === 'export') {
      const format = data.format || 'csv';
      const subscribers = await newsletterService.getAllSubscribers();

      await trackEvent('newsletter_exported', session.user.id, {
        format,
        count: subscribers.length,
      });

      errorLogger.info(
        `Newsletter exported (${format}) - ${subscribers.length} subscribers`,
        context.withUserId(session.user.id).build()
      );

      if (format === 'json') {
        return successResponse({ success: true, data: subscribers }, 200);
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

    errorLogger.warn(`Invalid action: ${action}`, context.withUserId(session.user.id).build());
    return badRequest('Invalid action');
  } catch (error) {
    errorLogger.error(
      'Error in newsletter POST handler',
      error,
      context.build()
    );
    return internalServerError('Failed to process newsletter action');
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/newsletter')
    .withMethod('DELETE')
    .withRequestId(requestId);

  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      errorLogger.warn('Unauthorized newsletter DELETE access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return badRequest('Subscriber ID is required');
    }

    await newsletterService.deleteSubscriber(id);

    await trackEvent('newsletter_deleted', session.user.id, {
      subscriberId: id,
    });

    errorLogger.info(`Subscriber ${id} deleted`, context.withUserId(session.user.id).build());
    return successResponse({ success: true }, 200);
  } catch (error) {
    errorLogger.error(
      'Error in newsletter DELETE handler',
      error,
      context.build()
    );
    return internalServerError('Failed to delete subscriber');
  }
}
