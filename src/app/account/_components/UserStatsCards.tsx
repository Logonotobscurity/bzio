'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ShoppingCart, Activity } from 'lucide-react';
import type { UserStats, StatCard } from '../_types/dashboard';

interface UserStatsCardsProps {
  stats: UserStats;
}

const cardConfig: Record<keyof UserStats, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
  quoteRequests: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  checkouts: {
    icon: ShoppingCart,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  totalActivity: {
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
};

const statusColors: Record<string, string> = {
  live: 'bg-green-100 text-green-800',
  active: 'bg-blue-100 text-blue-800',
  track: 'bg-purple-100 text-purple-800',
};

function StatCardComponent({ stat, config }: { stat: StatCard; config: typeof cardConfig.quoteRequests }) {
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.label}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={`${statusColors[stat.status]} text-xs capitalize`}>
            {stat.status}
          </Badge>
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stat.total}</div>
        <p className="text-sm text-muted-foreground mt-1">
          <span className={stat.change > 0 ? 'text-green-600' : ''}>
            +{stat.change}
          </span>{' '}
          {stat.changePeriod}
        </p>
      </CardContent>
    </Card>
  );
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCardComponent stat={stats.quoteRequests} config={cardConfig.quoteRequests} />
      <StatCardComponent stat={stats.checkouts} config={cardConfig.checkouts} />
      <StatCardComponent stat={stats.totalActivity} config={cardConfig.totalActivity} />
    </div>
  );
}

export default UserStatsCards;
