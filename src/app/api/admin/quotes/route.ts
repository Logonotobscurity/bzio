import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { trackEvent } from '@/lib/analytics';
import { successResponse, unauthorized, badRequest, notFound, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

/**
 * Quote Management API
 * POST /api/admin/quotes - Create quote
 * PUT /api/admin/quotes/[id] - Update quote
 * DELETE /api/admin/quotes/[id] - Delete quote
 * POST /api/admin/quotes/[id]/approve - Approve quote
 * POST /api/admin/quotes/[id]/reject - Reject quote
 */

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/quotes')
    .withMethod('POST')
    .withRequestId(requestId);

  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      errorLogger.warn('Unauthorized quotes API access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const body = await request.json();
    const { action, id, reason, ...data } = body;

    // Validate required fields
    if (!action) {
      return badRequest('Action is required');
    }

    // Approve quote
    if (action === 'approve' && id) {
      await trackEvent('quote_approved', session.user.id, {
        quoteId: id,
      });

      errorLogger.info(
        `Quote ${id} approved`,
        context.withUserId(session.user.id).build()
      );

      return successResponse({ success: true, quoteId: id }, 200);
    }

    // Reject quote
    if (action === 'reject' && id) {
      if (!reason) {
        return badRequest('Reason is required for rejecting a quote');
      }

      await trackEvent('quote_rejected', session.user.id, {
        quoteId: id,
        reason,
      });

      errorLogger.info(
        `Quote ${id} rejected`,
        context.withUserId(session.user.id).build()
      );

      return successResponse({ success: true, quoteId: id }, 200);
    }

    // Update quote status
    if (action === 'update-status' && id) {
      if (!data.status) {
        return badRequest('Status is required');
      }

      await trackEvent('quote_status_updated', session.user.id, {
        quoteId: id,
        newStatus: data.status,
      });

      errorLogger.info(
        `Quote ${id} status updated to ${data.status}`,
        context.withUserId(session.user.id).build()
      );

      return successResponse({ success: true, quoteId: id }, 200);
    }

    errorLogger.warn(
      `Invalid action: ${action}`,
      context.withUserId(session.user.id).build()
    );
    return badRequest('Invalid action');
  } catch (error) {
    errorLogger.error(
      'Error in quotes POST handler',
      error,
      context.build()
    );
    return internalServerError('Failed to process quote action');
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/quotes')
    .withMethod('DELETE')
    .withRequestId(requestId);

  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      errorLogger.warn('Unauthorized quotes DELETE access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return badRequest('Quote ID is required');
    }

    await trackEvent('quote_deleted', session.user.id, {
      quoteId: id,
    });

    errorLogger.info(
      `Quote ${id} deleted`,
      context.withUserId(session.user.id).build()
    );

    return successResponse({ success: true }, 200);
  } catch (error) {
    errorLogger.error(
      'Error in quotes DELETE handler',
      error,
      context.build()
    );
    return internalServerError('Failed to delete quote');
  }
}
