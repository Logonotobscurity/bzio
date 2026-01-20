import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '@/lib/auth-constants';
import { getAnalyticsSummary, getConversionFunnel } from '../_services/analytics.service';
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/analytics');
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== USER_ROLES.ADMIN) {
    redirect('/403');
  }

  const [summary, funnel] = await Promise.all([
    getAnalyticsSummary(30),
    getConversionFunnel(30),
  ]);

  return <AnalyticsClient summary={summary} funnel={funnel} />;
}
