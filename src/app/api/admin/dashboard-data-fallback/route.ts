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

/**
 * GET /api/admin/dashboard-data-fallback
 * Fallback endpoint using non-optimized but more reliable queries
 * Used when the optimized endpoint fails
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // ✅ CRITICAL: Use NextAuth session for proper role-based access control
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    console.log('[DASHBOARD_FALLBACK] Admin request received', { adminId: session.user?.id });

    // Fetch all data in parallel with longer timeouts
    console.log('[DASHBOARD_FALLBACK] Fetching data...');
    const [activitiesResult, statsResult, quotesResult, newUsersResult, newsletterResult, formsResult] =
      await Promise.allSettled([
        getRecentActivities(0, 50),
        getActivityStats(),
        getQuotes(0, 20),
        getNewUsers(0, 20),
        getNewsletterSubscribers(0, 20),
        getFormSubmissions(0, 20),
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
    const activities: any[] = activitiesResult.status === 'fulfilled' ? (activitiesResult.value?.data || []) : [];
    const stats = statsResult.status === 'fulfilled' ? statsResult.value : {
      totalUsers: 0,
      newUsersThisWeek: 0,
      totalQuotes: 0,
      pendingQuotes: 0,
      totalNewsletterSubscribers: 0,
      totalFormSubmissions: 0,
      totalCheckouts: 0,
    };
    const quotes: any[] = quotesResult.status === 'fulfilled' ? (quotesResult.value?.data || []) : [];
    const newUsers: any[] = newUsersResult.status === 'fulfilled' ? (newUsersResult.value?.data || []) : [];
    const newsletter: any[] = newsletterResult.status === 'fulfilled' ? (newsletterResult.value?.data || []) : [];
    const forms: any[] = formsResult.status === 'fulfilled' ? (formsResult.value?.data || []) : [];

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
