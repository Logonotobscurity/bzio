import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getRecentQuotes, getOrderStats } from '@/app/admin/_actions/orders';
import { successResponse, forbidden, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

/**
 * GET /api/admin/orders
 * Fetch orders/quotes data for the dashboard
 * ADMIN-ONLY ENDPOINT
 */
export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/orders')
    .withMethod('GET')
    .withRequestId(requestId);

  try {
    // ✅ CRITICAL: Verify admin access
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      errorLogger.warn(
        'Unauthorized orders API access attempt',
        context.withUserId(session?.user?.id).build()
      );
      return forbidden('Admin access required');
    }

    const [orders, stats] = await Promise.all([
      getRecentQuotes(20),
      getOrderStats(),
    ]);

    const data = {
      orders,
      stats,
      timestamp: new Date().toISOString(),
    };

    errorLogger.info(
      'Orders data fetched successfully',
      context.withUserId(session.user.id).build()
    );

    return successResponse(data, 200, undefined);
  } catch (error) {
    errorLogger.error(
      'Error fetching orders',
      error,
      context.build()
    );
    return internalServerError('Failed to fetch orders');
  }
}
