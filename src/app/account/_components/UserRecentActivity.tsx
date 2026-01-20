'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  ShoppingCart,
  MessageSquare,
  Eye,
  Search,
  UserPlus,
  Mail,
  Activity,
  UserCog,
  MapPin,
  Building2,
  Lock,
  Bell,
  BellRing,
} from 'lucide-react';
import type { UserActivityItem, ActivityType } from '../_types/dashboard';

interface UserRecentActivityProps {
  activities: UserActivityItem[];
}

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  // Existing events
  quote_requested: FileText,
  checkout_completed: ShoppingCart,
  form_submitted: MessageSquare,
  product_viewed: Eye,
  search_performed: Search,
  user_registered: UserPlus,
  newsletter_signup: Mail,
  // Settings events
  profile_updated: UserCog,
  address_created: MapPin,
  address_updated: MapPin,
  address_deleted: MapPin,
  company_updated: Building2,
  password_changed: Lock,
  notification_read: Bell,
  notification_preferences_updated: BellRing,
};

const activityColors: Record<ActivityType, { bg: string; text: string }> = {
  // Existing events
  quote_requested: { bg: 'bg-blue-100', text: 'text-blue-600' },
  checkout_completed: { bg: 'bg-green-100', text: 'text-green-600' },
  form_submitted: { bg: 'bg-orange-100', text: 'text-orange-600' },
  product_viewed: { bg: 'bg-purple-100', text: 'text-purple-600' },
  search_performed: { bg: 'bg-gray-100', text: 'text-gray-600' },
  user_registered: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  newsletter_signup: { bg: 'bg-pink-100', text: 'text-pink-600' },
  // Settings events
  profile_updated: { bg: 'bg-teal-100', text: 'text-teal-600' },
  address_created: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  address_updated: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  address_deleted: { bg: 'bg-red-100', text: 'text-red-600' },
  company_updated: { bg: 'bg-amber-100', text: 'text-amber-600' },
  password_changed: { bg: 'bg-rose-100', text: 'text-rose-600' },
  notification_read: { bg: 'bg-slate-100', text: 'text-slate-600' },
  notification_preferences_updated: { bg: 'bg-violet-100', text: 'text-violet-600' },
};

function formatActivityType(type: ActivityType): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function UserRecentActivity({ activities }: UserRecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Your latest platform interactions</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type] || Activity;
              const colors = activityColors[activity.type] || { bg: 'bg-gray-100', text: 'text-gray-600' };

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`h-4 w-4 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {formatActivityType(activity.type)}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No activities yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start exploring to see your activity here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UserRecentActivity;
