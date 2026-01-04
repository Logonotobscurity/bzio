/**
 * analyticsService.test.ts
 * Unit tests for analytics service
 */

import * as analyticsService from '../analyticsService';
import { createMockPrismaClient } from '../__tests__/setup';

jest.mock('@/lib/db', () => ({
  prisma: createMockPrismaClient(),
}));

describe('analyticsService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = require('@/lib/db').prisma;
  });

  describe('trackProductView', () => {
    it('should track a product view', async () => {
      const mockView = {
        id: 1,
        productId: 1,
        userId: 1,
        ipAddress: '127.0.0.1',
        createdAt: new Date(),
      };

      (mockPrisma.productView.create as jest.Mock).mockResolvedValueOnce(mockView);

      const result = await analyticsService.trackProductView(1, 1, '127.0.0.1');

      expect(result).toEqual(mockView);
      expect(mockPrisma.productView.create).toHaveBeenCalledWith({
        data: { productId: 1, userId: 1, ipAddress: '127.0.0.1' },
      });
    });

    it('should track product view without user ID', async () => {
      const mockView = {
        id: 1,
        productId: 1,
        userId: undefined,
        ipAddress: '127.0.0.1',
        createdAt: new Date(),
      };

      (mockPrisma.productView.create as jest.Mock).mockResolvedValueOnce(mockView);

      const result = await analyticsService.trackProductView(1, undefined, '127.0.0.1');

      expect(result.productId).toBe(1);
      expect(result.userId).toBeUndefined();
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.productView.create as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(analyticsService.trackProductView(1, 1, '127.0.0.1')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('trackSearchQuery', () => {
    it('should track a search query', async () => {
      const mockQuery = {
        id: 1,
        query: 'test query',
        userId: 1,
        results: 5,
        createdAt: new Date(),
      };

      (mockPrisma.searchQuery.create as jest.Mock).mockResolvedValueOnce(mockQuery);

      const result = await analyticsService.trackSearchQuery('test query', 1, 5);

      expect(result).toEqual(mockQuery);
      expect(mockPrisma.searchQuery.create).toHaveBeenCalledWith({
        data: { query: 'test query', userId: 1, results: 5 },
      });
    });

    it('should track search with default results count', async () => {
      const mockQuery = {
        id: 1,
        query: 'test',
        userId: undefined,
        results: 0,
        createdAt: new Date(),
      };

      (mockPrisma.searchQuery.create as jest.Mock).mockResolvedValueOnce(mockQuery);

      const result = await analyticsService.trackSearchQuery('test');

      expect(result.results).toBe(0);
    });
  });

  describe('getProductViewCount', () => {
    it('should return product view count', async () => {
      (mockPrisma.productView.count as jest.Mock).mockResolvedValueOnce(15);

      const result = await analyticsService.getProductViewCount(1);

      expect(result).toBe(15);
      expect(mockPrisma.productView.count).toHaveBeenCalledWith({
        where: { productId: 1 },
      });
    });

    it('should return 0 for product with no views', async () => {
      (mockPrisma.productView.count as jest.Mock).mockResolvedValueOnce(0);

      const result = await analyticsService.getProductViewCount(999);

      expect(result).toBe(0);
    });
  });

  describe('getSearchQueryStats', () => {
    it('should return top search queries', async () => {
      const mockStats = [
        { query: 'spices', _count: 50 },
        { query: 'grains', _count: 35 },
        { query: 'oils', _count: 20 },
      ];

      (mockPrisma.searchQuery.groupBy as jest.Mock).mockResolvedValueOnce(mockStats);

      const result = await analyticsService.getSearchQueryStats(3);

      expect(result).toHaveLength(3);
      expect(result[0].query).toBe('spices');
      expect(result[0]._count).toBe(50);
    });

    it('should use default limit of 10', async () => {
      (mockPrisma.searchQuery.groupBy as jest.Mock).mockResolvedValueOnce([]);

      await analyticsService.getSearchQueryStats();

      expect(mockPrisma.searchQuery.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('should handle empty search history', async () => {
      (mockPrisma.searchQuery.groupBy as jest.Mock).mockResolvedValueOnce([]);

      const result = await analyticsService.getSearchQueryStats();

      expect(result).toEqual([]);
    });
  });
});
