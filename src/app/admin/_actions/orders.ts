import { prisma } from '@/lib/db';

export interface OrderData {
  id: string;
  reference: string;
  buyerContactEmail: string;
  buyerContactPhone?: string;
  status: string;
  total?: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getRecentQuotes(limit: number = 20): Promise<OrderData[]> {
  try {
    const quotes = await prisma.quote.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        buyerContactEmail: true,
        buyerContactPhone: true,
        status: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        lines: {
          select: { id: true },
        },
      },
    });

    return quotes.map((quote) => ({
      id: quote.id,
      reference: quote.reference || '',
      buyerContactEmail: quote.buyerContactEmail || 'Unknown',
      buyerContactPhone: quote.buyerContactPhone,
      status: quote.status || 'draft',
      total: quote.total,
      itemCount: quote.lines?.length || 0,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
}

export async function getOrderStats() {
  try {
    const [totalQuotes, pendingQuotes, completedQuotes, totalValue] = await Promise.all([
      prisma.quote.count(),
      prisma.quote.count({
        where: { status: 'draft' },
      }),
      prisma.quote.count({
        where: { status: { in: ['accepted', 'completed'] } },
      }),
      prisma.quote.aggregate({
        _sum: { total: true },
        where: { status: { in: ['accepted', 'completed'] } },
      }),
    ]);

    return {
      totalQuotes,
      pendingQuotes,
      completedQuotes,
      totalValue: totalValue._sum.total || 0,
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return {
      totalQuotes: 0,
      pendingQuotes: 0,
      completedQuotes: 0,
      totalValue: 0,
    };
  }
}
