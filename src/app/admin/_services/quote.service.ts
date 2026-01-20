"use server";

import { prisma } from '@/lib/prisma';
import { getCachedQuery, CACHE_TTL, CACHE_KEYS, invalidateDashboardCache } from '@/lib/cache';
import { QuoteStatus } from '@prisma/client';

export interface QuoteFilters {
  search?: string;
  status?: string;
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
    `${CACHE_KEYS.RECENT_QUOTES}:stats`,
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
        totalValue: parseFloat(valueAgg._sum.totalAmount?.toString() || '0'),
        avgValue: parseFloat(valueAgg._avg.totalAmount?.toString() || '0'),
      };
    },
    { ttl: CACHE_TTL.SHORT }
  );
}

/**
 * Get quotes with filters and pagination
 */
export async function getQuotes(filters: QuoteFilters = {}, page = 1, limit = 20) {
  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.OR = [
      { reference: { contains: filters.search, mode: 'insensitive' } },
      { user: { email: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  if (filters.status && filters.status !== 'all') {
    where.status = filters.status;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) (where.createdAt as Record<string, Date>).gte = filters.dateFrom;
    if (filters.dateTo) (where.createdAt as Record<string, Date>).lte = filters.dateTo;
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    where.totalAmount = {};
    if (filters.minAmount !== undefined) (where.totalAmount as Record<string, number>).gte = filters.minAmount;
    if (filters.maxAmount !== undefined) (where.totalAmount as Record<string, number>).lte = filters.maxAmount;
  }

  const [quotes, total] = await Promise.all([
    prisma.quotes.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        users: {
          select: { firstName: true, lastName: true, email: true, companies: { select: { name: true } } },
        },
        quoteLines: { include: { product: { select: { name: true, sku: true } } } },
      },
    }),
    prisma.quotes.count({ where }),
  ]);

  return {
    quotes: quotes.map((quote) => ({
      id: quote.id.toString(),
      reference: quote.reference,
      status: quote.status,
      totalAmount: parseFloat(quote.totalAmount.toString()),
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      user: quote.user,
      quote_lines: quote.quoteLines.map((line) => ({
        id: line.id.toString(),
        quantity: line.quantity,
        unitPrice: parseFloat(line.unitPrice.toString()),
        product: line.product,
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
  await invalidateDashboardCache(CACHE_KEYS.RECENT_QUOTES);
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
    quote.user?.company?.name || '',
    quote.lines.length.toString(),
    quote.totalAmount.toString(),
    quote.status,
    new Date(quote.createdAt).toISOString(),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
