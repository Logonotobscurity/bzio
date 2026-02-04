'use client';

import { useQuery } from '@tanstack/react-query';

export interface Newsletter {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribed: number;
  bounced: number;
  engagementRate: number;
}

export interface NewsletterFilters {
  status?: string;
  email?: string;
  limit?: number;
  offset?: number;
}

/**
 * Hook to fetch newsletter subscribers with optional filtering
 */
export function useNewsletterSubscribers(filters?: NewsletterFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.email) queryParams.append('email', filters.email);
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.offset) queryParams.append('offset', filters.offset.toString());

  return useQuery<Newsletter[]>({
    queryKey: ['newsletter-subscribers', filters],
    queryFn: async () => {
      const response = await fetch(`/api/admin/newsletter/subscribers?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch newsletter subscribers');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch newsletter statistics
 */
export function useNewsletterStats() {
  return useQuery<NewsletterStats>({
    queryKey: ['newsletter-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/newsletter/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch newsletter stats');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a single subscriber by ID
 */
export function useSubscriberDetail(subscriberId: string | null | undefined) {
  return useQuery<Newsletter>({
    queryKey: ['subscriber-detail', subscriberId],
    queryFn: async () => {
      if (!subscriberId) throw new Error('Subscriber ID is required');
      const response = await fetch(`/api/admin/newsletter/subscribers/${subscriberId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscriber details');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    enabled: !!subscriberId, // Only run if subscriberId exists
  });
}
