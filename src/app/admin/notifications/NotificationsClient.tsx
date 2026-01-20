'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle, User, FileText } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data: Record<string, unknown> | null;
  createdAt: Date | string;
}

interface NotificationsClientProps {
  notifications: Notification[];
}

const typeIcons: Record<string, React.ReactNode> = {
  INFO: <Info className="h-4 w-4 text-blue-500" />,
  SUCCESS: <CheckCircle className="h-4 w-4 text-green-500" />,
  WARNING: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  ERROR: <AlertCircle className="h-4 w-4 text-red-500" />,
  NEW_USER: <User className="h-4 w-4 text-purple-500" />,
  NEW_QUOTE: <FileText className="h-4 w-4 text-indigo-500" />,
};

const typeColors: Record<string, string> = {
  INFO: 'bg-blue-100 text-blue-800',
  SUCCESS: 'bg-green-100 text-green-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  NEW_USER: 'bg-purple-100 text-purple-800',
  NEW_QUOTE: 'bg-indigo-100 text-indigo-800',
};

export default function NotificationsClient({ notifications }: NotificationsClientProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter((notif) => {
    const matchesType = typeFilter === 'all' || notif.type === typeFilter;
    const matchesRead = readFilter === 'all' || 
      (readFilter === 'unread' && !notif.isRead) ||
      (readFilter === 'read' && notif.isRead);
    
    return matchesType && matchesRead;
  });

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
  };

  const uniqueTypes = [...new Set(notifications.map(n => n.type))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">System notifications and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {stats.unread} unread
          </Badge>
          <Button variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <Card 
              key={notif.id} 
              className={`transition-colors ${!notif.isRead ? 'bg-blue-50/50 border-blue-200' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {typeIcons[notif.type] || <Bell className="h-4 w-4 text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{notif.title}</h3>
                      <Badge className={`text-xs ${typeColors[notif.type] || 'bg-gray-100'}`}>
                        {notif.type}
                      </Badge>
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    {notif.isRead ? 'View' : 'Mark Read'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
