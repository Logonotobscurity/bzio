import prisma from '@/lib/prisma';
import type { ProductView, SearchQuery } from '@prisma/client';

export const trackProductView = async (productId: number, userId?: number, ipAddress?: string): Promise<ProductView> => {
  return prisma.productView.create({
    data: { productId, userId, ipAddress },
  });
};

export const trackSearchQuery = async (query: string, userId?: number, results: number = 0): Promise<SearchQuery> => {
  return prisma.searchQuery.create({
    data: { query, userId, results },
  });
};

export const getProductViewCount = async (productId: number): Promise<number> => {
  return prisma.productView.count({
    where: { productId },
  });
};

export const getSearchQueryStats = async (limit: number = 10) => {
  return prisma.searchQuery.groupBy({
    by: ['query'],
    _count: true,
    orderBy: { _count: { query: 'desc' } },
    take: limit,
  });
};
