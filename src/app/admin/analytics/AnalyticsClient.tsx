'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Calendar, 
  Download,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface DailyMetric {
  date: string;
  count: number;
}

interface EventTypeMetric {
  type: string;
  count: number;
  percentage: number;
}

interface AnalyticsSummary {
  totalEvents: number;
  uniqueUsers: number;
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  topEventTypes: EventTypeMetric[];
  dailyTrend: DailyMetric[];
  hourlyDistribution: { hour: number; count: number }[];
}

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
}

interface AnalyticsClientProps {
  summary: AnalyticsSummary;
  funnel: { steps: FunnelStep[] };
}

const eventTypeColors: Record<string, string> = {
  product_viewed: '#8b5cf6',
  quote_requested: '#3b82f6',
  checkout_completed: '#22c55e',
  form_submitted: '#f97316',
  search_performed: '#6b7280',
  user_registered: '#6366f1',
  newsletter_signup: '#ec4899',
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f97316', '#ec4899', '#6366f1', '#14b8a6'];

export default function AnalyticsClient({ summary, funnel }: AnalyticsClientProps) {
  const [timeRange, setTimeRange] = useState('30');

  // Format daily trend data for the chart
  const chartData = useMemo(() => {
    return summary.dailyTrend.map((day) => ({
      date: day.date,
      displayDate: new Date(day.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      events: day.count,
    }));
  }, [summary.dailyTrend]);

  // Format hourly data for the chart
  const hourlyData = useMemo(() => {
    return summary.hourlyDistribution.map((h) => ({
      hour: `${h.hour}:00`,
      displayHour: h.hour === 0 ? '12 AM' : h.hour === 12 ? '12 PM' : h.hour < 12 ? `${h.hour} AM` : `${h.hour - 12} PM`,
      count: h.count,
    }));
  }, [summary.hourlyDistribution]);

  // Calculate average daily events
  const avgDailyEvents = useMemo(() => {
    if (chartData.length === 0) return 0;
    const total = chartData.reduce((sum, d) => sum + d.events, 0);
    return Math.round(total / chartData.length);
  }, [chartData]);

  // Calculate trend (comparing last 7 days to previous 7 days)
  const trend = useMemo(() => {
    if (chartData.length < 14) return { value: 0, isUp: true };
    const recent = chartData.slice(-7).reduce((sum, d) => sum + d.events, 0);
    const previous = chartData.slice(-14, -7).reduce((sum, d) => sum + d.events, 0);
    if (previous === 0) return { value: 0, isUp: true };
    const change = ((recent - previous) / previous) * 100;
    return { value: Math.abs(change).toFixed(1), isUp: change >= 0 };
  }, [chartData]);

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?action=export&days=${timeRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track platform activity and user behavior</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{summary.totalEvents.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">{summary.eventsToday}</span>
              <span className="text-muted-foreground">today</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">{summary.uniqueUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{summary.eventsThisWeek.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{summary.eventsThisMonth.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Trend Chart - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle>Daily Activity Trend</CardTitle>
                <CardDescription>Events per day over the selected period</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <p className="text-muted-foreground">Avg. Daily</p>
                <p className="font-semibold text-lg">{avgDailyEvents.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">7-Day Trend</p>
                <div className={`flex items-center gap-1 font-semibold text-lg ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.isUp ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {trend.value}%
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Events']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEvents)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Types Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              <div>
                <CardTitle>Event Types Distribution</CardTitle>
                <CardDescription>Breakdown of events by type</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.topEventTypes.map((event, index) => (
                <div key={event.type} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: eventTypeColors[event.type] || CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="capitalize font-medium">{event.type.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="font-semibold">{event.count.toLocaleString()} <span className="text-muted-foreground font-normal">({event.percentage.toFixed(1)}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${event.percentage}%`,
                        backgroundColor: eventTypeColors[event.type] || CHART_COLORS[index % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
              {summary.topEventTypes.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No event data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle>Hourly Activity Distribution</CardTitle>
                <CardDescription>When users are most active</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="displayHour" 
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    interval={3}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#9ca3af' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [value.toLocaleString(), 'Events']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {hourlyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${260 + index * 4}, 70%, 60%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from view to checkout</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnel.steps.map((step, index) => (
              <div key={step.name} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{step.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {step.count.toLocaleString()} ({step.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div 
                  className="h-10 bg-gradient-to-r from-blue-500 to-blue-400 rounded flex items-center justify-center text-white font-medium transition-all duration-500"
                  style={{ width: `${Math.max(step.percentage, 10)}%` }}
                >
                  {step.count.toLocaleString()}
                </div>
                {index < funnel.steps.length - 1 && (
                  <div className="flex items-center justify-center my-2">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground ml-1">
                      {funnel.steps[index].count > 0
                        ? `${((funnel.steps[index + 1].count / funnel.steps[index].count) * 100).toFixed(1)}% conversion`
                        : ''}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {funnel.steps.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No funnel data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
