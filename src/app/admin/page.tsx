import { redirect } from "next/navigation";
import { auth } from '@/lib/auth/config';
import {
  getRecentActivities,
  getActivityStats,
  getQuotes,
  getNewUsers,
  getNewsletterSubscribers,
  getFormSubmissions,
} from './_actions/activities';
import AdminDashboardClient from './_components/AdminDashboardClient';
import type { ActivityEvent } from './_types/activity';

export default async function AdminPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/admin/login');
  }

  console.log('[ADMIN_PAGE] Loading dashboard for admin:', session.user.email);
  
  // Fetch all data in parallel with individual error handling
  // Use Promise.allSettled so one slow query doesn't block all others
  // With extended timeout for Vercel compatibility
  const results = await Promise.allSettled([
    getRecentActivities(20),  // Reduced from 50 to 20 for faster load
    getActivityStats(),
    getQuotes(undefined, 20),
    getNewUsers(20),
    getNewsletterSubscribers(20),
    getFormSubmissions(20),
  ]);

  console.log('[ADMIN_PAGE] Query results:', {
    activities: results[0].status,
    stats: results[1].status,
    quotes: results[2].status,
    users: results[3].status,
    newsletter: results[4].status,
    forms: results[5].status,
  });

  // Extract results with fallbacks
  const activities: ActivityEvent[] = results[0].status === 'fulfilled' ? (Array.isArray(results[0].value) ? results[0].value : results[0].value.data || []) : [];
  if (results[0].status === 'rejected') {
    console.error('[ADMIN_PAGE] Activities error:', results[0].reason);
  }
  
  const stats = results[1].status === 'fulfilled' ? results[1].value : {
    totalUsers: 0,
    newUsersThisWeek: 0,
    totalQuotes: 0,
    pendingQuotes: 0,
    totalNewsletterSubscribers: 0,
    totalFormSubmissions: 0,
    totalCheckouts: 0,
  };
  const quotes: any[] = results[2].status === 'fulfilled' ? (Array.isArray(results[2].value) ? results[2].value : results[2].value.data || []) : [];
  const newUsers: any[] = results[3].status === 'fulfilled' ? (Array.isArray(results[3].value) ? results[3].value : results[3].value.data || []) : [];
  const newsletterSubscribers: any[] = results[4].status === 'fulfilled' ? (Array.isArray(results[4].value) ? results[4].value : results[4].value.data || []) : [];
  const formSubmissions: any[] = results[5].status === 'fulfilled' ? (Array.isArray(results[5].value) ? results[5].value : results[5].value.data || []) : [];

  return (
    <AdminDashboardClient
      stats={stats}
      activities={activities}
      quotes={quotes}
      newUsers={newUsers}
      newsletterSubscribers={newsletterSubscribers}
      formSubmissions={formSubmissions}
    />
  );
}
