import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { USER_ROLES } from '@/lib/auth-constants';
import { successResponse, unauthorized, internalServerError } from '@/lib/api-response';
import { API_ERROR_CODES } from '@/lib/error-handler';
import { errorLogger, createContext } from '@/lib/error-logger';
import {
  getRecentActivities,
  getActivityStats,
  getQuotes,
  getNewUsers,
  getNewsletterSubscribers,
  getFormSubmissions,
} from '@/app/admin/_actions/activities';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const requestId = crypto.randomUUID();
    
    if (!session?.user || session.user.role !== USER_ROLES.ADMIN) {
      errorLogger.warn(
        'Unauthorized dashboard access attempt',
        createContext()
          .withEndpoint('/api/admin/dashboard-data')
          .withMethod('GET')
          .withRequestId(requestId)
          .build()
      );
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const results = await Promise.allSettled([
      getRecentActivities(limit),
      getActivityStats(),
      getQuotes(undefined, limit),
      getNewUsers(limit),
      getNewsletterSubscribers(limit),
      getFormSubmissions(limit),
    ]);

    const activities = results[0].status === 'fulfilled' ? (results[0].value.data || []) : [];
    const stats = results[1].status === 'fulfilled' ? results[1].value : {
      totalUsers: 0,
      newUsersThisWeek: 0,
      totalQuotes: 0,
      pendingQuotes: 0,
      totalNewsletterSubscribers: 0,
      totalFormSubmissions: 0,
      totalCheckouts: 0,
    };
    const quotes = results[2].status === 'fulfilled' ? (results[2].value.data || []) : [];
    const newUsers = results[3].status === 'fulfilled' ? (results[3].value.data || []) : [];
    const newsletter = results[4].status === 'fulfilled' ? (results[4].value.data || []) : [];
    const forms = results[5].status === 'fulfilled' ? (results[5].value.data || []) : [];

    const data = {
      stats,
      activities,
      quotes,
      newUsers,
      newsletter,
      forms,
    };

    errorLogger.info(
      'Dashboard data fetched successfully',
      createContext()
        .withEndpoint('/api/admin/dashboard-data')
        .withMethod('GET')
        .withRequestId(requestId)
        .build()
    );

    return successResponse(data, 200);
  } catch (error) {
    errorLogger.error(
      'Error fetching dashboard data',
      error,
      createContext()
        .withEndpoint('/api/admin/dashboard-data')
        .withMethod('GET')
        .build()
    );
    return internalServerError('Failed to fetch dashboard data');
  }
}
