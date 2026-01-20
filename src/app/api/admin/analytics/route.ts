import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { USER_ROLES } from '@/lib/auth-constants';
import { 
  getAnalyticsSummary, 
  getAnalyticsEvents, 
  getConversionFunnel,
  exportAnalyticsToCSV 
} from '@/app/admin/_services/analytics.service';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const days = parseInt(searchParams.get('days') || '30');

    if (action === 'summary') {
      const summary = await getAnalyticsSummary(days);
      return NextResponse.json(summary);
    }

    if (action === 'funnel') {
      const funnel = await getConversionFunnel(days);
      return NextResponse.json(funnel);
    }

    if (action === 'export') {
      const csv = await exportAnalyticsToCSV({
        eventType: searchParams.get('eventType') || undefined,
        dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
        dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      });
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const filters = {
      eventType: searchParams.get('eventType') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    };

    const result = await getAnalyticsEvents(filters, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[ADMIN_ANALYTICS_API]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
