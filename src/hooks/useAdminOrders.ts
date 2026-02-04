'use client';

import { useQuery } from '@tanstack/react-query';

export interface Order {
  id: string;
  orderNumber: string;
  buyerEmail: string;
  buyerPhone?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderFilters {
  status?: string;
  email?: string;
  limit?: number;
  offset?: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

/**
 * Hook to fetch all orders with optional filtering
 */
export function useAdminOrders(filters?: OrderFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.email) queryParams.append('email', filters.email);
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.offset) queryParams.append('offset', filters.offset.toString());

  return useQuery<Order[]>({
    queryKey: ['admin-orders', filters],
    queryFn: async () => {
      const response = await fetch(`/api/admin/orders?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a single order by ID with all details
 */
export function useOrderDetail(orderId: string | null | undefined) {
  return useQuery<Order>({
    queryKey: ['order-detail', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    enabled: !!orderId, // Only run if orderId exists
  });
}

/**
 * Hook to fetch order statistics
 */
export function useOrderStats() {
  return useQuery<OrderStats>({
    queryKey: ['order-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch order stats');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch recent orders (limited set for dashboards)
 */
export function useRecentOrders(limit: number = 10) {
  return useQuery<Order[]>({
    queryKey: ['recent-orders', limit],
    queryFn: async () => {
      const response = await fetch(`/api/admin/orders?limit=${limit}&sort=recent`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent orders');
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
