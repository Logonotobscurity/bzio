import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getUserDashboardData } from '@/app/account/_actions/dashboard';

export async function GET() {
  try {
    const session = await auth();

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id as string);
    const dashboardData = await getUserDashboardData(userId);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('[ACCOUNT_DASHBOARD_API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
