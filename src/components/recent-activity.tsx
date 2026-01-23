'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from 'lucide-react';
import { format } from 'date-fns';

interface Activity {
  id: string;
  eventType: string;
  title: string | null;
  description: string;
  referenceId: string | null;
  referenceType: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export default function RecentActivity() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchActivities();
    }
  }, [session]);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/user/activities?limit=10');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (eventType: string) => {
    const icons: Record<string, string> = {
      view: '👁️',
      cart_add: '🛒',
      cart_remove: '🗑️',
      quote_create: '📝',
      quote_update: '✏️',
      quote_submitted: '✓',
      search: '🔍',
      purchase: '💳',
      order_placement: '📦',
      profile_update: '👤',
    };
    return icons[eventType] || '📌';
  };

  const getActivityColor = (eventType: string) => {
    const colors: Record<string, string> = {
      view: 'bg-blue-100 text-blue-800',
      cart_add: 'bg-green-100 text-green-800',
      cart_remove: 'bg-orange-100 text-orange-800',
      quote_create: 'bg-purple-100 text-purple-800',
      quote_update: 'bg-purple-100 text-purple-800',
      quote_submitted: 'bg-emerald-100 text-emerald-800',
      search: 'bg-cyan-100 text-cyan-800',
      purchase: 'bg-red-100 text-red-800',
      order_placement: 'bg-indigo-100 text-indigo-800',
      profile_update: 'bg-gray-100 text-gray-800',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInHours < 168) {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  return (
    <Card className="rounded-lg sm:rounded-2xl border-0 sm:border">
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
        <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader className="h-5 w-5 animate-spin mr-2" />
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            No activities yet. Start exploring to see your activity history.
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="text-xl sm:text-2xl flex-shrink-0">
                  {getActivityIcon(activity.eventType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base line-clamp-1">
                        {activity.title || activity.description}
                      </p>
                      {activity.title && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <Badge className={`${getActivityColor(activity.eventType)} text-[10px] sm:text-xs py-0.5 px-1.5 flex-shrink-0`}>
                      {activity.eventType.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {formatDate(activity.createdAt)}
                  </p>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 space-y-0.5">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <p key={key} className="line-clamp-1">
                          <strong>{key}:</strong> {String(value)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
