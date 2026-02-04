'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

/**
 * Generic hook for fetching data from any endpoint
 * Provides consistent error handling and caching behavior
 */
export function useFetchData<T>(
  url: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: [url],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch data from ${url} (Status: ${response.status})`
        );
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes default
    gcTime: 10 * 60 * 1000, // 10 minutes default
    retry: 2,
    ...options,
  });
}

/**
 * Generic hook for fetching paginated data
 */
export function usePaginatedData<T>(
  baseUrl: string,
  page: number = 1,
  limit: number = 20,
  options?: Omit<UseQueryOptions<{ data: T[]; total: number; page: number }>, 'queryKey' | 'queryFn'>
) {
  const offset = (page - 1) * limit;
  const url = `${baseUrl}?limit=${limit}&offset=${offset}`;

  return useQuery({
    queryKey: [baseUrl, page, limit],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch paginated data from ${url}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Helper to construct API error messages consistently
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred while fetching data';
}

/**
 * Helper to determine if data is in error state
 */
export function isDataError(error: unknown): error is Error {
  return error instanceof Error;
}
