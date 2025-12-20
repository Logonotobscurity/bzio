import { NextResponse } from 'next/server';
import {
  getRecentActivities,
  getActivityStats,
  getQuotes,
  getNewUsers,
  getNewsletterSubscribers,
  getFormSubmissions,
} from '@/app/admin/_actions/activities';

/**
 * GET /api/admin/dashboard-data-fallback
 * Fallback endpoint using non-optimized but more reliable queries
 * Used when the optimized endpoint fails
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    console.log('[DASHBOARD_FALLBACK] Request received');

    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const url = new URL(request.url);
      if (!url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Fetch all data in parallel with longer timeouts
    console.log('[DASHBOARD_FALLBACK] Fetching data...');
    const [activitiesResult, statsResult, quotesResult, newUsersResult, newsletterResult, formsResult] =
      await Promise.allSettled([
        getRecentActivities(50),
        getActivityStats(),
        getQuotes(undefined, 20),
        getNewUsers(20),
        getNewsletterSubscribers(20),
        getFormSubmissions(20),
      ]);

    console.log('[DASHBOARD_FALLBACK] Results:', {
      activities: activitiesResult.status,
      stats: statsResult.status,
      quotes: quotesResult.status,
      users: newUsersResult.status,
      newsletter: newsletterResult.status,
      forms: formsResult.status,
    });

    // Extract results with fallbacks
    const activities = activitiesResult.status === 'fulfilled' ? activitiesResult.value : [];
    const stats = statsResult.status === 'fulfilled' ? statsResult.value : {
      totalUsers: 0,
      newUsersThisWeek: 0,
      totalQuotes: 0,
      pendingQuotes: 0,
      totalNewsletterSubscribers: 0,
      totalFormSubmissions: 0,
      totalCheckouts: 0,
    };
    const quotes = quotesResult.status === 'fulfilled' ? quotesResult.value : [];
    const newUsers = newUsersResult.status === 'fulfilled' ? newUsersResult.value : [];
    const newsletter = newsletterResult.status === 'fulfilled' ? newsletterResult.value : [];
    const forms = formsResult.status === 'fulfilled' ? formsResult.value : [];

    const duration = Date.now() - startTime;

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

    console.log('[DASHBOARD_FALLBACK] Returning data', { duration });

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'private, max-age=5, stale-while-revalidate=10',
        'X-Dashboard-Source': 'fallback',
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    console.error('[DASHBOARD_FALLBACK] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
