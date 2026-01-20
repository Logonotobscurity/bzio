import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { getRecentQuotes, getOrderStats } from '@/app/admin/_actions/orders';

/**
 * GET /api/admin/orders
 * Fetch orders/quotes data for the dashboard
 * ADMIN-ONLY ENDPOINT
 */
export async function GET() {
  try {
    // ✅ CRITICAL: Verify admin access
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
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
