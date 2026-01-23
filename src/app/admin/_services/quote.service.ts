"use server";

import { prisma } from '@/lib/db';
import { getCachedQuery, CACHE_TTL, invalidateDashboardCache } from '@/lib/cache';
import { QuoteStatus, Prisma } from '@prisma/client';

export interface QuoteFilters {
  search?: string;
  status?: QuoteStatus | string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface QuoteStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  totalValue: number;
  avgValue: number;
}

/**
 * Get quote statistics with caching
 */
export async function getQuoteStats(): Promise<QuoteStats> {
  return getCachedQuery(
    "RECENT_QUOTES_STATS",
    async () => {
      const [total, pending, accepted, rejected, valueAgg] = await Promise.all([
        prisma.quotes.count(),
        prisma.quotes.count({ where: { status: 'PENDING' } }),
        prisma.quotes.count({ where: { status: 'ACCEPTED' } }),
        prisma.quotes.count({ where: { status: 'REJECTED' } }),
        prisma.quotes.aggregate({ _sum: { totalAmount: true }, _avg: { totalAmount: true } }),
      ]);

      return {
        total,
        pending,
        accepted,
        rejected,
        totalValue: Number(valueAgg._sum.totalAmount || 0),
        avgValue: Number(valueAgg._avg.totalAmount || 0),
      };
    },
    CACHE_TTL.short
  );
}

/**
 * Get quotes with filters and pagination
 */
export async function getQuotes(filters: QuoteFilters = {}, page = 1, limit = 20) {
  const where: Prisma.quotesWhereInput = {};

  if (filters.search) {
    where.OR = [
      { reference: { contains: filters.search, mode: 'insensitive' } },
      { users: { email: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  if (filters.status && filters.status !== 'all') {
    where.status = filters.status as QuoteStatus;
  }

  const [quotes, total] = await Promise.all([
    prisma.quotes.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        users: {
          select: { firstName: true, lastName: true, email: true, organization: { select: { name: true } } },
        },
        quote_lines: { include: { products: { select: { name: true, sku: true } } } },
      },
    }),
    prisma.quotes.count({ where }),
  ]);

  return {
    quotes: quotes.map((quote) => ({
      id: quote.id.toString(),
      reference: quote.reference,
      status: quote.status,
      totalAmount: Number(quote.totalAmount),
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      user: quote.users,
      quote_lines: quote.quote_lines.map((line) => ({
        id: line.id.toString(),
        quantity: line.quantity,
        unitPrice: Number(line.unitPrice || 0),
        product: line.products,
      })),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Update quote status
 */
export async function updateQuoteStatus(quoteId: number, status: QuoteStatus) {
  const quote = await prisma.quotes.update({
    where: { id: quoteId },
    data: { status , updatedAt: new Date()},
  });
  await invalidateDashboardCache();
  return quote;
}

/**
 * Export quotes to CSV
 */
export async function exportQuotesToCSV(filters: QuoteFilters = {}): Promise<string> {
  const { quotes } = await getQuotes(filters, 1, 10000);
  
  const headers = ['Reference', 'Customer', 'Email', 'Company', 'Items', 'Total', 'Status', 'Created At'];
  const rows = quotes.map((quote) => [
    quote.reference,
    `${quote.user?.firstName || ''} ${quote.user?.lastName || ''}`.trim(),
    quote.user?.email || '',
    quote.user?.organization?.name || '',
    quote.quote_lines.length.toString(),
    quote.totalAmount.toString(),
    quote.status,
    new Date(quote.createdAt).toISOString(),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
