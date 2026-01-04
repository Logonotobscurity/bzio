import { QueryClient } from '@tanstack/react-query';
import { makeQueryClient, getQueryClient } from '../client';

describe('React Query Client Configuration', () => {
  describe('makeQueryClient', () => {
    it('should create a QueryClient with default options', () => {
      const queryClient = makeQueryClient();
      expect(queryClient).toBeInstanceOf(QueryClient);
    });

    it('should have correct query defaults', () => {
      const queryClient = makeQueryClient();
      const defaultOptions = (queryClient.getDefaultOptions() as any).queries;

      expect(defaultOptions.staleTime).toBe(60 * 1000); // 1 minute
      expect(defaultOptions.gcTime).toBe(5 * 60 * 1000); // 5 minutes
      expect(defaultOptions.retry).toBe(1);
      expect(defaultOptions.refetchOnWindowFocus).toBe(true);
    });

    it('should have correct mutation defaults', () => {
      const queryClient = makeQueryClient();
      const defaultOptions = (queryClient.getDefaultOptions() as any).mutations;

      expect(defaultOptions.retry).toBe(1);
    });

    it('should implement exponential backoff for retries', () => {
      const queryClient = makeQueryClient();
      const defaultOptions = (queryClient.getDefaultOptions() as any).queries;
      const retryDelay = defaultOptions.retryDelay(0);

      expect(retryDelay).toBeLessThanOrEqual(1000 * 2);
      expect(retryDelay).toBeGreaterThanOrEqual(1000);
    });

    it('should cap retry delay at 30 seconds', () => {
      const queryClient = makeQueryClient();
      const defaultOptions = (queryClient.getDefaultOptions() as any).queries;
      const retryDelayMax = defaultOptions.retryDelay(10);

      expect(retryDelayMax).toBeLessThanOrEqual(30000);
    });
  });

  describe('getQueryClient', () => {
    it('should return a QueryClient instance on server', () => {
      const client = getQueryClient();
      expect(client).toBeInstanceOf(QueryClient);
    });

    it('should return the same instance on repeated calls in browser', () => {
      // Force browser environment
      const originalWindow = global.window;
      (global as any).window = {};

      try {
        const client1 = getQueryClient();
        const client2 = getQueryClient();

        expect(client1).toBe(client2);
      } finally {
        // Restore window
        (global as any).window = originalWindow;
      }
    });
  });

  describe('Query staleTime and gcTime', () => {
    it('should have appropriate cache times', () => {
      const queryClient = makeQueryClient();
      const defaultOptions = (queryClient.getDefaultOptions() as any).queries;

      // staleTime < gcTime
      expect(defaultOptions.staleTime).toBeLessThan(defaultOptions.gcTime);

      // Realistic values
      expect(defaultOptions.staleTime).toBeGreaterThan(0);
      expect(defaultOptions.gcTime).toBeGreaterThan(defaultOptions.staleTime);
    });
  });

  describe('Refetch configuration', () => {
    it('should refetch on window focus when stale', () => {
      const queryClient = makeQueryClient();
      const defaultOptions = (queryClient.getDefaultOptions() as any).queries;

      expect(defaultOptions.refetchOnWindowFocus).toBe(true);
    });

    it('should refetch on reconnect when stale', () => {
      const queryClient = makeQueryClient();
      const defaultOptions = (queryClient.getDefaultOptions() as any).queries;

      expect(defaultOptions.refetchOnReconnect).toBe('stale');
    });
  });
});
