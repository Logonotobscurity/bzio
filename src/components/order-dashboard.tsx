'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag } from 'lucide-react';

interface Order {
  id: string;
  reference: string;
  buyerContactEmail: string;
  buyerContactPhone?: string;
  status: string;
  total?: number;
  itemCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function OrderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
          setStats({
            totalOrders: data.stats?.totalQuotes || 0,
            pendingOrders: data.stats?.pendingQuotes || 0,
            totalValue: data.stats?.totalValue || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      negotiating: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-lg sm:rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">quotes in system</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg sm:rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">awaiting action</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg sm:rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">completed orders</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg sm:rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Completion Rate</CardTitle>
            <ShoppingBag className="h-4 w-4 text-purple-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">
              {stats.totalOrders > 0 
                ? Math.round(((stats.totalOrders - stats.pendingOrders) / stats.totalOrders) * 100)
                : 0}%
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">orders completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="rounded-lg sm:rounded-xl overflow-hidden">
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 pb-3 sm:pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="inline-block min-w-full px-3 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs sm:text-sm">
                      <TableHead className="font-semibold">Order ID</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">Customer</TableHead>
                      <TableHead className="font-semibold">Items</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="text-xs sm:text-sm hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium text-[11px] sm:text-sm whitespace-nowrap">{order.reference}</TableCell>
                        <TableCell className="text-[10px] sm:text-sm hidden sm:table-cell truncate max-w-xs">{order.buyerContactEmail}</TableCell>
                        <TableCell className="text-center">{order.itemCount}</TableCell>
                        <TableCell className="text-[10px] sm:text-sm hidden md:table-cell whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(order.status)} text-[10px] sm:text-xs py-1`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold whitespace-nowrap text-[11px] sm:text-sm">
                          {formatCurrency(order.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
