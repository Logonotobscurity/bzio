'use client';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationsClientProps {
  notifications: Notification[];
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const typeColors: Record<string, { bg: string; text: string }> = {
  info: { bg: 'bg-blue-100', text: 'text-blue-600' },
  success: { bg: 'bg-green-100', text: 'text-green-600' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  error: { bg: 'bg-red-100', text: 'text-red-600' },
};

export default function NotificationsClient({ notifications }: NotificationsClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with your account activity</p>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Info;
            const colors = typeColors[notification.type] || typeColors.info;

            return (
              <Card key={notification.id} className={notification.isRead ? 'opacity-70' : ''}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <Icon className={`h-4 w-4 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{notification.title}</h3>
                        {!notification.isRead && (
                          <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
            <CardTitle className="text-lg mb-2">No notifications</CardTitle>
            <CardDescription>
              You&apos;re all caught up! New notifications will appear here.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
