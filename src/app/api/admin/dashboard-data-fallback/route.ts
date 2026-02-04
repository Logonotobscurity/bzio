import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import {
  getRecentActivities,
  getActivityStats,
  getQuotes,
  getNewUsers,
  getNewsletterSubscribers,
  getFormSubmissions,
} from '@/app/admin/_actions/activities';
import { successResponse, unauthorized, internalServerError } from '@/lib/api-response';
import { errorLogger, createContext } from '@/lib/error-logger';

/**
 * GET /api/admin/dashboard-data-fallback
 * Fallback endpoint using non-optimized but more reliable queries
 * Used when the optimized endpoint fails
 */
export async function GET() {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/dashboard-data-fallback')
    .withMethod('GET')
    .withRequestId(requestId);

  const startTime = Date.now();

  try {
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      errorLogger.warn('Unauthorized dashboard fallback access', context.withUserId(session?.user?.id).build());
      return unauthorized();
    }

    errorLogger.info('Dashboard fallback data request', context.withUserId(session.user.id).build());

    // Fetch all data in parallel with longer timeouts
    const [activitiesResult, statsResult, quotesResult, newUsersResult, newsletterResult, formsResult] =
      await Promise.allSettled([
        getRecentActivities(0, 50),
        getActivityStats(),
        getQuotes(0, 20),
        getNewUsers(0, 20),
        getNewsletterSubscribers(0, 20),
        getFormSubmissions(0, 20),
      ]);

    // Extract results with fallbacks
    const activities = (activitiesResult.status === 'fulfilled' ? (activitiesResult.value?.data || []) : []) as unknown as Record<string, unknown>[];
    const stats = statsResult.status === 'fulfilled' ? statsResult.value : {
      totalUsers: 0,
      newUsersThisWeek: 0,
      totalQuotes: 0,
      pendingQuotes: 0,
      totalNewsletterSubscribers: 0,
      totalFormSubmissions: 0,
      totalCheckouts: 0,
    };
    const quotes = (quotesResult.status === 'fulfilled' ? (quotesResult.value?.data || []) : []) as unknown as Record<string, unknown>[];
    const newUsers = (newUsersResult.status === 'fulfilled' ? (newUsersResult.value?.data || []) : []) as unknown as Record<string, unknown>[];
    const newsletter = (newsletterResult.status === 'fulfilled' ? (newsletterResult.value?.data || []) : []) as unknown as Record<string, unknown>[];
    const forms = (formsResult.status === 'fulfilled' ? (formsResult.value?.data || []) : []) as unknown as Record<string, unknown>[];

    const duration = Date.now() - startTime;

    errorLogger.info(
      `Dashboard fallback data fetched (${duration}ms)`,
      context.withUserId(session.user.id).build()
    );

    const responseData = {
      stats,
      activities,
      quotes,
      newUsers,
      newsletter,
      forms,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      source: 'fallback',
    };

    return successResponse(responseData, 200);
  } catch (error) {
    errorLogger.error(
      'Error fetching fallback dashboard data',
      error,
      context.build()
    );
    return internalServerError('Failed to fetch dashboard data');
  }
}
