/**
 * Quote Repository
 * 
 * Data access layer for Quote entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Quote } from '@/lib/types/domain';
import { mapQuoteRow, mapArrayIds } from './db/adapter';

interface CreateQuoteInput {
  reference: string;
  userId?: number;
  buyerContactEmail: string;
  buyerContactPhone?: string;
  buyerCompanyId?: string;
  status?: string;
  lines: Array<{
    productId?: string;
    productName: string;
    productSku?: string;
    qty: number;
    unitPrice?: number;
    description?: string;
  }>;
}

interface UpdateQuoteInput {
  status?: string;
  total?: number;
  updatedAt?: Date;
}

export class QuoteRepository extends BaseRepository<Quote, CreateQuoteInput, UpdateQuoteInput> {
  async findAll(limit?: number, skip?: number): Promise<Quote[]> {
    try {
      const rows = await prisma.quotes.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: { quote_lines: true },
      });
      return (mapArrayIds(rows) as unknown) as Quote[];
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number): Promise<Quote | null> {
    try {
      const row = await prisma.quotes.findUnique({
        where: { id: Number(id) },
        include: { quote_lines: true },
      });
      return row ? (mapQuoteRow(row) as Quote) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByReference(reference: string): Promise<Quote | null> {
    try {
      const row = await prisma.quotes.findUnique({
        where: { reference },
        include: { quote_lines: true },
      });
      return row ? (mapQuoteRow(row) as Quote) : null;
    } catch (error) {
      this.handleError(error, 'findByReference');
    }
  }

  async findByUserId(userId: number, limit?: number, skip?: number): Promise<Quote[]> {
    try {
      const rows = await prisma.quotes.findMany({
        where: { userId },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: { quote_lines: true },
      });
      return (mapArrayIds(rows) as unknown) as Quote[];
    } catch (error) {
      this.handleError(error, 'findByUserId');
    }
  }

  async create(data: CreateQuoteInput): Promise<Quote> {
    try {
      // Map input to Prisma shape; coerce status to enum-like uppercase.
      const payload: any = {
        reference: data.reference,
        userId: data.userId,
        buyerContactEmail: data.buyerContactEmail,
        buyerContactPhone: data.buyerContactPhone,
        buyerCompanyId: data.buyerCompanyId,
        status: data.status ? (data.status as string).toUpperCase() : 'DRAFT',
        lines: {
          create: data.lines.map((line) => ({
            productId: line.productId,
            productName: line.productName,
            productSku: line.productSku,
            qty: line.qty,
            unitPrice: line.unitPrice,
            description: line.description,
          })),
        },
      };

      const row = await prisma.quotes.create({ data: payload, include: { quote_lines: true } });
      return mapQuoteRow(row) as Quote;
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateQuoteInput): Promise<Quote> {
    try {
      const row = await prisma.quotes.update({
        where: { id: Number(id) },
        data: data as any,
        include: { quote_lines: true },
      });
      return mapQuoteRow(row) as Quote;
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number): Promise<boolean> {
    try {
      await prisma.quotes.delete({ where: { id: Number(id) } });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    try {
      return await prisma.quotes.count({ where });
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Find quotes by status
   */
  async findByStatus(status: string, limit?: number, skip?: number): Promise<Quote[]> {
    try {
      const rows = await prisma.quotes.findMany({
        where: { status: (status as any).toString().toUpperCase() as any },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: { quote_lines: true },
      });
      return (mapArrayIds(rows) as unknown) as Quote[];
    } catch (error) {
      this.handleError(error, 'findByStatus');
    }
  }

  /**
   * Count pending quotes
   */
  async countPending(): Promise<number> {
    try {
      return await prisma.quotes.count({
        where: {
          status: { in: (['DRAFT', 'PENDING'] as any) },
        },
      });
    } catch (error) {
      this.handleError(error, 'countPending');
    }
  }
}

export const quoteRepository = new QuoteRepository();
