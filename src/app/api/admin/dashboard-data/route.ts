import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { USER_ROLES } from '@/lib/auth-constants';
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
  const session = await auth();
  
  if (!session?.user || session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  return NextResponse.json({
    stats,
    activities,
    quotes,
    newUsers,
    newsletter,
    forms,
  });
}
