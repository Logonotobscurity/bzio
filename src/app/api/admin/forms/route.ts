import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { formService } from '@/services';
import { trackEvent } from '@/lib/analytics';
import { successResponse, unauthorized, badRequest, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

/**
 * Form Submissions Management API
 * POST /api/admin/forms - Create/update form submission
 * PUT /api/admin/forms/[id] - Update status
 * DELETE /api/admin/forms/[id] - Delete submission
 * POST /api/admin/forms/[id]/respond - Mark as responded
 * POST /api/admin/forms/[id]/spam - Mark as spam
 */

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/forms')
    .withMethod('POST')
    .withRequestId(requestId);

  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      errorLogger.warn('Unauthorized forms API access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const body = await request.json();
    const { action, id, response, ...data } = body;

    if (!action) {
      return badRequest('Action is required');
    }

    // Mark as responded
    if (action === 'respond' && id && response) {
      const submission = await formService.respondToSubmission(
        id,
        response,
        session.user.email || 'admin'
      );

      await trackEvent('form_responded', session.user.id, {
        formId: id,
      });

      errorLogger.info(
        `Form ${id} marked as responded`,
        context.withUserId(session.user.id).build()
      );

      return successResponse({ success: true, submission }, 200);
    }

    // Mark as spam
    if (action === 'spam' && id) {
      const submission = await formService.deleteSubmission(id);

      errorLogger.info(
        `Form ${id} marked as spam`,
        context.withUserId(session.user.id).build()
      );

      return successResponse({ success: true, submission }, 200);
    }

    // Update status
    if (action === 'update-status' && id && data.status) {
      const submission = await formService.updateSubmission(id, {
        status: data.status,
      });

      errorLogger.info(
        `Form ${id} status updated to ${data.status}`,
        context.withUserId(session.user.id).build()
      );

      return successResponse({ success: true, submission }, 200);
    }

    // Archive submission
    if (action === 'archive' && id) {
      const submission = await formService.updateSubmission(id, {
        status: 'archived',
      });

      errorLogger.info(
        `Form ${id} archived`,
        context.withUserId(session.user.id).build()
      );

      return successResponse({ success: true, submission }, 200);
    }

    errorLogger.warn(`Invalid action: ${action}`, context.withUserId(session.user.id).build());
    return badRequest('Invalid action');
  } catch (error) {
    errorLogger.error(
      'Error processing form action',
      error,
      context.build()
    );
    return internalServerError('Failed to process form action');
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/forms')
    .withMethod('DELETE')
    .withRequestId(requestId);

  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      errorLogger.warn('Unauthorized forms DELETE access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return badRequest('Form ID is required');
    }

    await formService.deleteSubmission(id);

    await trackEvent('form_deleted', session.user.id, {
      formId: id,
    });

    errorLogger.info(
      `Form ${id} deleted`,
      context.withUserId(session.user.id).build()
    );

    return successResponse({ success: true }, 200);
  } catch (error) {
    errorLogger.error(
      'Error deleting form',
      error,
      context.build()
    );
    return internalServerError('Failed to delete form');
  }
}
