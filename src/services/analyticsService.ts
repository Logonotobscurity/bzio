import { prisma } from '@/lib/db';

export const trackProductView = async (productId: number, userId?: number, ipAddress?: string): Promise<any> => {
  const payload: any = { productId };
  if (typeof userId !== 'undefined') payload.userId = userId;
  if (typeof ipAddress !== 'undefined') payload.ipAddress = ipAddress;
  return (await prisma.product_views.create({ data: payload as any })) as unknown as any;
};

export const trackSearchQuery = async (query: string, userId?: number, results: number = 0): Promise<any> => {
  const payload: any = { query, results };
  if (typeof userId !== 'undefined') payload.userId = userId;
  return (await prisma.search_queries.create({ data: payload as any })) as unknown as any;
};

export const getProductViewCount = async (productId: number): Promise<number> => {
  return await prisma.product_views.count({ where: { productId } });
};

export const getSearchQueryStats = async (limit: number = 10) => {
  return (await prisma.search_queries.groupBy({
    by: ['query'],
    _count: true,
    orderBy: { _count: { query: 'desc' } },
    take: limit,
  })) as unknown as any;
};
