import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getRecentQuotes, getOrderStats } from '@/app/admin/_actions/orders';

/**
 * GET /api/admin/orders
 * Fetch orders/quotes data for the dashboard
 * ADMIN-ONLY ENDPOINT
 */
export async function GET(request: Request) {
  try {
    // ✅ CRITICAL: Verify admin access
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const [orders, stats] = await Promise.all([
      getRecentQuotes(20),
      getOrderStats(),
    ]);

    return NextResponse.json(
      {
        orders,
        stats,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('[ORDERS_API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
