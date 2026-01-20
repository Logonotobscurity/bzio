import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { USER_ROLES } from '@/lib/auth-constants';
import { updateQuoteStatus } from '@/app/admin/_services/quote.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const quote = await updateQuoteStatus(parseInt(id), status);
    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error('[ADMIN_QUOTE_UPDATE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
