'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, FileText, Mail, ShoppingCart } from 'lucide-react';
import type { ActivityEvent } from '../_actions/activities';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface EventsAnalyticsProps {
  activities: ActivityEvent[];
}

export function EventsAnalytics({ activities }: EventsAnalyticsProps) {
  // Process data for visualizations
  const processEventData = () => {
    // Count events by type
    const eventCounts = {
      user_registration: 0,
      quote_request: 0,
      checkout: 0,
      newsletter_signup: 0,
      form_submission: 0,
    };

    const eventsByDay: Record<string, number> = {};
    const eventsByHour: Record<string, number> = {};

    activities.forEach((activity: ActivityEvent) => {
      const eventType = activity.type || 'unknown';
      if (eventType in eventCounts) {
        eventCounts[eventType as keyof typeof eventCounts]++;
      }

      // Group by day
      const activityDate = new Date(activity.timestamp);
      const dayKey = activityDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      eventsByDay[dayKey] = (eventsByDay[dayKey] || 0) + 1;

      // Group by hour
      const hour = activityDate.getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      eventsByHour[hourKey] = (eventsByHour[hourKey] || 0) + 1;
    });

    return { eventCounts, eventsByDay, eventsByHour };
  };

  const { eventCounts, eventsByDay, eventsByHour } = processEventData();

  // Convert to array format for charts
  const eventTypesData = [
    { name: 'User Signups', value: eventCounts.user_registration, color: '#3b82f6' },
    { name: 'Quote Requests', value: eventCounts.quote_request, color: '#8b5cf6' },
    { name: 'Checkouts', value: eventCounts.checkout, color: '#ec4899' },
    { name: 'Newsletter', value: eventCounts.newsletter_signup, color: '#f59e0b' },
    { name: 'Form Submissions', value: eventCounts.form_submission, color: '#10b981' },
  ];

  const timelineData = Object.entries(eventsByDay)
    .slice(-7) // Last 7 days
    .map(([day, count]) => ({
      name: day,
      events: count,
    }));

  const hourlyData = Object.entries(eventsByHour)
    .slice(-24) // Last 24 hours
    .map(([hour, count]) => ({
      name: hour,
      events: count,
    }));

  const totalEvents = activities.length;
  const avgEventsPerDay = totalEvents > 0 ? Math.round(totalEvents / 7) : 0;

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">{avgEventsPerDay}/day avg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Signups</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventCounts.user_registration}</div>
            <p className="text-xs text-muted-foreground">this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quote Requests</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventCounts.quote_request}</div>
            <p className="text-xs text-muted-foreground">this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checkouts</CardTitle>
            <ShoppingCart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventCounts.checkout}</div>
            <p className="text-xs text-muted-foreground">this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Signups</CardTitle>
            <Mail className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventCounts.newsletter_signup}</div>
            <p className="text-xs text-muted-foreground">this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
            <CardDescription>Breakdown by event type</CardDescription>
          </CardHeader>
          <CardContent>
            {totalEvents > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eventTypesData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eventTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No event data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Events Over Time</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="events" stroke="#3b82f6" dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No timeline data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Hourly Event Distribution</CardTitle>
            <CardDescription>Events by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            {hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="events" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hourly data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Event Summary</CardTitle>
          <CardDescription>Detailed breakdown of all event types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventTypesData.map((event, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: event.color }}
                  ></div>
                  <span className="font-medium">{event.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold">{event.value}</span>
                  <span className="text-muted-foreground text-sm">
                    {totalEvents > 0 ? `${Math.round((event.value / totalEvents) * 100)}%` : '0%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
