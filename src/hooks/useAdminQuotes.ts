'use client';

import { useQuery } from '@tanstack/react-query';

export interface Quote {
  id: string;
  reference: string;
  buyerContactEmail: string;
  buyerContactPhone?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'completed';
  total?: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  lines?: QuoteLine[];
}

export interface QuoteLine {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

export interface QuoteFilters {
  status?: string;
  email?: string;
  limit?: number;
  offset?: number;
}

/**
 * Hook to fetch all quotes with optional filtering
 * 
 * @param filters - Filter options (status, email, pagination)
 * @returns Query result with quotes data
 */
export function useAdminQuotes(filters?: QuoteFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.email) queryParams.append('email', filters.email);
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.offset) queryParams.append('offset', filters.offset.toString());

  return useQuery<Quote[]>({
    queryKey: ['admin-quotes', filters],
    queryFn: async () => {
      const response = await fetch(`/api/admin/quotes?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a single quote by ID with all details
 */
export function useQuoteDetail(quoteId: string | null | undefined) {
  return useQuery<Quote>({
    queryKey: ['quote-detail', quoteId],
    queryFn: async () => {
      if (!quoteId) throw new Error('Quote ID is required');
      const response = await fetch(`/api/admin/quotes/${quoteId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quote details');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    enabled: !!quoteId, // Only run if quoteId exists
  });
}

/**
 * Hook to fetch quote statistics
 */
export function useQuoteStats() {
  return useQuery({
    queryKey: ['quote-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/quotes/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch quote stats');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}
