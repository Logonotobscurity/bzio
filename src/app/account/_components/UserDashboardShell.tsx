'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { UserGreeting } from './UserGreeting';
import { UserStatsCards } from './UserStatsCards';
import { UserAccountDetails } from './UserAccountDetails';
import { UserRecentActivity } from './UserRecentActivity';
import type { UserDashboardData } from '../_types/dashboard';

interface UserDashboardShellProps {
  data: UserDashboardData;
}

export function UserDashboardShell({ data: initialData }: UserDashboardShellProps) {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/account/dashboard-data');
      if (response.ok) {
        const newData = await response.json();
        setData(newData);
      }
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <UserGreeting user={data.user} />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <UserStatsCards stats={data.stats} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Details - 1 column */}
        <div className="lg:col-span-1">
          <UserAccountDetails user={data.user} />
        </div>

        {/* Recent Activity - 2 columns */}
        <div className="lg:col-span-2">
          <UserRecentActivity activities={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}

export default UserDashboardShell;
