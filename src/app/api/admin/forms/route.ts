import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { formService, analyticsService } from '@/services';

/**
 * Form Submissions Management API
 * POST /api/admin/forms - Create/update form submission
 * PUT /api/admin/forms/[id] - Update status
 * DELETE /api/admin/forms/[id] - Delete submission
 * POST /api/admin/forms/[id]/respond - Mark as responded
 * POST /api/admin/forms/[id]/spam - Mark as spam
 */

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, id, response, ...data } = body;

    // Mark as responded
    if (action === 'respond' && id && response) {
      const submission = await formService.respondToSubmission(
        id,
        response,
        session.user.email || 'admin'
      );

      await analyticsService.trackEvent({
        eventType: 'form_responded',
        userId: session.user.id,
        metadata: { formId: id },
      });

      return NextResponse.json({ success: true, submission }, { status: 200 });
    }

    // Mark as spam
    if (action === 'spam' && id) {
      const submission = await formService.deleteSubmission(id);

      return NextResponse.json({ success: true, submission }, { status: 200 });
    }

    // Update status
    if (action === 'update-status' && id && data.status) {
      const submission = await formService.updateSubmission(id, {
        status: data.status,
      });

      return NextResponse.json({ success: true, submission }, { status: 200 });
    }

    // Archive submission
    if (action === 'archive' && id) {
      const submission = await formService.updateSubmission(id, {
        status: 'archived',
      });

      return NextResponse.json({ success: true, submission }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[FORMS_API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Form ID required' }, { status: 400 });
    }

    await formService.deleteSubmission(id);

    await analyticsService.trackEvent({
      eventType: 'form_deleted',
      userId: session.user.id,
      metadata: { formId: id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[FORMS_DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}
