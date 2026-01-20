'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  brand: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface QuoteRequest {
  id: string;
  productId: string;
  quantity: number;
  companyName: string;
  email: string;
  phone: string;
  status: "PENDING" | 'approved' | 'rejected';
  createdAt: string;
}

export interface FormSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  subscribedAt: string;
}

// ============================================================================
// API CALL FUNCTIONS
// ============================================================================

/**
 * Fetch all products with pagination
 */
export const fetchProducts = async (page: number = 1, limit: number = 18) => {
  const { data } = await axios.get('/api/products', {
    params: { page, limit },
  });
  return data;
};

/**
 * Fetch all categories
 */
export const fetchCategories = async () => {
  const { data } = await axios.get('/api/categories');
  return data;
};

/**
 * Fetch all brands
 */
export const fetchBrands = async () => {
  const { data } = await axios.get('/api/brands');
  return data;
};

/**
 * Fetch quote requests
 */
export const fetchQuoteRequests = async () => {
  const { data } = await axios.get('/api/quote-requests');
  return data;
};

/**
 * Create a new quote request
 */
export const createQuoteRequest = async (quoteData: Partial<QuoteRequest>) => {
  const { data } = await axios.post('/api/quote-requests', quoteData);
  return data;
};

/**
 * Fetch form submissions
 */
export const fetchFormSubmissions = async () => {
  const { data } = await axios.get('/api/forms');
  return data;
};

/**
 * Submit a contact form
 */
export const submitContactForm = async (formData: Partial<FormSubmission>) => {
  const { data } = await axios.post('/api/forms', formData);
  return data;
};

/**
 * Subscribe to newsletter
 */
export const subscribeNewsletter = async (email: string) => {
  const { data } = await axios.post('/api/newsletter-subscribe', { email });
  return data;
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch products with caching and pagination
 * Automatically refetches stale data and handles loading/error states
 */
export const useProducts = (page: number = 1, limit: number = 18) => {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: () => fetchProducts(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch categories with caching
 * Data is cached for extended periods since categories change infrequently
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook to fetch brands with caching
 * Data is cached for extended periods since brands change infrequently
 */
export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook to fetch quote requests
 * Auto-refetches every minute for real-time updates
 */
export const useQuoteRequests = () => {
  return useQuery({
    queryKey: ['quote-requests'],
    queryFn: fetchQuoteRequests,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook to fetch form submissions
 * Auto-refetches every minute for real-time updates
 */
export const useFormSubmissions = () => {
  return useQuery({
    queryKey: ['form-submissions'],
    queryFn: fetchFormSubmissions,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook to fetch newsletter subscriptions
 * Auto-refetches every 5 minutes for real-time updates
 */
export const useNewsletterSubscriptions = () => {
  return useQuery({
    queryKey: ['newsletter-subscriptions'],
    queryFn: async () => {
      const { data } = await axios.get('/api/newsletter-subscribe');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a quote request
 * Automatically invalidates quote requests list after successful creation
 */
export const useCreateQuoteRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuoteRequest,
    onSuccess: () => {
      // Invalidate quote requests list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
    },
    onError: (error) => {
      console.error('Failed to create quote request:', error);
    },
  });
};

/**
 * Hook to submit a contact form
 * Automatically invalidates form submissions list after successful submission
 */
export const useSubmitContactForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      // Invalidate form submissions list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['form-submissions'] });
    },
    onError: (error) => {
      console.error('Failed to submit contact form:', error);
    },
  });
};

/**
 * Hook to subscribe to newsletter
 * Automatically invalidates newsletter subscriptions list after successful subscription
 */
export const useSubscribeNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscribeNewsletter,
    onSuccess: () => {
      // Invalidate newsletter subscriptions list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscriptions'] });
    },
    onError: (error) => {
      console.error('Failed to subscribe to newsletter:', error);
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to manually invalidate query cache
 * Useful for forcing refetches when needed
 */
export const useInvalidateQuery = () => {
  const queryClient = useQueryClient();

  return {
    invalidateProducts: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    invalidateCategories: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    invalidateBrands: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
    invalidateQuoteRequests: () => queryClient.invalidateQueries({ queryKey: ['quote-requests'] }),
    invalidateFormSubmissions: () => queryClient.invalidateQueries({ queryKey: ['form-submissions'] }),
    invalidateNewsletter: () => queryClient.invalidateQueries({ queryKey: ['newsletter-subscriptions'] }),
  };
};
