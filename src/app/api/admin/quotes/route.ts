import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { analyticsService } from '@/services';

/**
 * Quote Management API
 * POST /api/admin/quotes - Create quote
 * PUT /api/admin/quotes/[id] - Update quote
 * DELETE /api/admin/quotes/[id] - Delete quote
 * POST /api/admin/quotes/[id]/approve - Approve quote
 * POST /api/admin/quotes/[id]/reject - Reject quote
 */

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, id, reason, ...data } = body;

    // Approve quote
    if (action === 'approve' && id) {
      await analyticsService.trackEvent({
        eventType: 'quote_approved',
        userId: session.user.id,
        metadata: { quoteId: id },
      });

      return NextResponse.json({ success: true, quoteId: id }, { status: 200 });
    }

    // Reject quote
    if (action === 'reject' && id) {
      await analyticsService.trackEvent({
        eventType: 'quote_rejected',
        userId: session.user.id,
        metadata: { quoteId: id, reason },
      });

      return NextResponse.json({ success: true, quoteId: id }, { status: 200 });
    }

    // Update quote status
    if (action === 'update-status' && id) {
      await analyticsService.trackEvent({
        eventType: 'quote_status_updated',
        userId: session.user.id,
        metadata: { quoteId: id, newStatus: data.status },
      });

      return NextResponse.json({ success: true, quoteId: id }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[QUOTES_API] Error:', error);
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
      return NextResponse.json({ error: 'Quote ID required' }, { status: 400 });
    }

    await analyticsService.trackEvent({
      eventType: 'quote_deleted',
      userId: session.user.id,
      metadata: { quoteId: id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[QUOTES_DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}
