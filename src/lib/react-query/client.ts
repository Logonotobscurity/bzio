import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a new QueryClient instance with optimized settings
 * Includes automatic refetching, caching, and error handling
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch queries on mount if data exists
        staleTime: 60 * 1000, // 1 minute
        // Cache data for 5 minutes by default
        gcTime: 5 * 60 * 1000,
        // Retry failed requests once with exponential backoff
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for fresh data
        refetchOnWindowFocus: true,
        // Refetch on network reconnection (only when data is stale)
        refetchOnReconnect: 'always',
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
}

let clientSingleton: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }

  // Browser: make a single query client for the app's lifetime
  if (!clientSingleton) {
    clientSingleton = makeQueryClient();
  }

  return clientSingleton;
}
