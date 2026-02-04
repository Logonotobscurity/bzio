'use client';

import { useQuery } from '@tanstack/react-query';

export interface DashboardStats {
  totalQuotes: number;
  pendingQuotes: number;
  completedQuotes: number;
  totalValue: number;
}

export interface RecentQuote {
  id: string;
  reference: string;
  buyerContactEmail: string;
  buyerContactPhone?: string;
  status: string;
  total?: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentQuotes: RecentQuote[];
}

/**
 * Hook to fetch admin dashboard data (stats and recent quotes)
 * Uses React Query for efficient caching and refetching
 * 
 * @param limit - Number of recent quotes to fetch (default: 20)
 * @returns Query result with dashboard data, loading, and error states
 */
export function useAdminDashboard(limit: number = 20) {
  return useQuery<DashboardData>({
    queryKey: ['admin-dashboard', limit],
    queryFn: async () => {
      const response = await fetch(`/api/admin/dashboard?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch only dashboard statistics
 * Lighter weight than full dashboard hook for stat-only components
 */
export function useAdminStats() {
  return useQuery<DashboardStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch recent quotes with automatic refetching
 */
export function useRecentQuotes(limit: number = 20, refetchInterval?: number) {
  return useQuery<RecentQuote[]>({
    queryKey: ['recent-quotes', limit],
    queryFn: async () => {
      const response = await fetch(`/api/admin/quotes?limit=${limit}&sort=recent`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent quotes');
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: refetchInterval, // Optional auto-refetch
  });
}
