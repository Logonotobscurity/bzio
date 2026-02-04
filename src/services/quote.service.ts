/**
 * Quote Service
 * 
 * Business logic layer for Quote operations
 * Handles quote management, validation, and workflows
 */

import { QuoteRepository, prisma } from '@/repositories';
import { errorLoggingService } from './error-logging.service';

const quoteRepository = new QuoteRepository();

/**
 * Helper function to format error logging
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * QuoteService - Manages quote operations
 */
export class QuoteService {
  /**
   * Get all quotes with optional pagination
   */
  async getAllQuotes(limit?: number, skip?: number) {
    try {
      const quotes = await quoteRepository.findAll(limit, skip);
      return quotes || [];
    } catch (error) {
      await errorLoggingService.logError({
        message: getErrorMessage(error),
        severity: 'high',
        metadata: {
          context: 'QuoteService.getAllQuotes',
        },
      });
      throw error;
    }
  }

  /**
   * Get quote by ID with validation
   */
  async getQuoteById(id: string | number) {
    try {
      if (!id) {
        throw new Error('Quote ID is required');
      }

      const quote = await quoteRepository.findById(id);
      if (!quote) {
        throw new Error(`Quote not found: ${id}`);
      }

      return quote;
    } catch (error) {
      await errorLoggingService.logError({
        message: getErrorMessage(error),
        severity: 'medium',
        metadata: {
          context: 'QuoteService.getQuoteById',
          quoteId: String(id),
        },
      });
      throw error;
    }
  }

  /**
   * Get quote by reference number
   */
  async getQuoteByReference(reference: string) {
    try {
      if (!reference) {
        throw new Error('Reference is required');
      }

      const quote = await quoteRepository.findByReference(reference);
      if (!quote) {
        throw new Error(`Quote not found: ${reference}`);
      }

      return quote;
    } catch (error) {
      await errorLoggingService.logError({
        message: getErrorMessage(error),
        severity: 'medium',
        metadata: {
          context: 'QuoteService.getQuoteByReference',
          reference,
        },
      });
      throw error;
    }
  }

  /**
   * Update quote status and other fields
   */
  async updateQuote(id: string | number, updates: Record<string, unknown>) {
    try {
      if (!id) {
        throw new Error('Quote ID is required');
      }

      if (!updates || Object.keys(updates).length === 0) {
        throw new Error('No fields to update');
      }

      const quote = await quoteRepository.update(id, updates as any);
      return quote;
    } catch (error) {
      await errorLoggingService.logError({
        message: getErrorMessage(error),
        severity: 'high',
        metadata: {
          context: 'QuoteService.updateQuote',
          quoteId: String(id),
          updates: JSON.stringify(updates),
        },
      });
      throw error;
    }
  }

  /**
   * Delete quote by ID
   */
  async deleteQuote(id: string | number) {
    try {
      if (!id) {
        throw new Error('Quote ID is required');
      }

      // Verify quote exists before deletion
      await this.getQuoteById(id);

      const deleted = await quoteRepository.delete(id);
      if (!deleted) {
        throw new Error('Failed to delete quote');
      }

      return true;
    } catch (error) {
      await errorLoggingService.logError({
        message: getErrorMessage(error),
        severity: 'high',
        metadata: {
          context: 'QuoteService.deleteQuote',
          quoteId: String(id),
        },
      });
      throw error;
    }
  }

  /**
   * Get quotes by user ID
   */
  async getUserQuotes(userId: number, limit?: number, skip?: number) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const quotes = await quoteRepository.findByUserId(userId, limit, skip);
      return quotes || [];
    } catch (error) {
      await errorLoggingService.logError({
        message: getErrorMessage(error),
        severity: 'high',
        metadata: {
          context: 'QuoteService.getUserQuotes',
          userId,
        },
      });
      throw error;
    }
  }

  /**
   * Get quotes by status
   */
  async getQuotesByStatus(status: string, limit?: number, skip?: number) {
    try {
      if (!status) {
        throw new Error('Status is required');
      }

      const quotes = await quoteRepository.findByStatus(status, limit, skip);
      return quotes || [];
    } catch (error) {
      await errorLoggingService.logError({
        message: getErrorMessage(error),
        severity: 'high',
        metadata: {
          context: 'QuoteService.getQuotesByStatus',
          status,
        },
      });
      throw error;
    }
  }

  /**
   * Get quote count by status
   */
  async getQuoteCount(status?: string) {
    try {
      const where = status ? { status } : undefined;
      const count = await quoteRepository.count(where);
      return count || 0;
    } catch (error) {
      await errorLoggingService.logError({
        message: getErrorMessage(error),
        severity: 'medium',
        metadata: {
          context: 'QuoteService.getQuoteCount',
          status,
        },
      });
      throw error;
    }
  }

  /**
   * Create a new quote with line items and an initial event log.
   * This operation is performed within a transaction to ensure data consistency.
   */
  async createQuote(data: {
    reference?: string;
    userId?: number;
    actorId?: string;
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
  }) {
    const reference = data.reference || `Q-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    try {
      if (!data.buyerContactEmail || !data.lines) {
        throw new Error('Buyer contact email and line items are required');
      }

      const quote = await prisma.$transaction(async (tx) => {
        // Create the quote
        const newQuote = await (tx as any).quote.create({
          data: {
            reference,
            userId: data.userId,
            buyerContactEmail: data.buyerContactEmail,
            buyerContactPhone: data.buyerContactPhone,
            buyerCompanyId: data.buyerCompanyId,
            status: data.status || 'draft',
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
          },
          include: { lines: true },
        });

        // Log the creation event
        await (tx as any).quoteEvent.create({
          data: {
            quoteId: newQuote.id,
            actorId: data.actorId || 'system',
            eventType: 'created',
            payload: {
              status: newQuote.status,
              itemCount: (newQuote as any).lines?.length || 0,
            },
          },
        });

        return newQuote;
      });

      return quote;
    } catch (error) {
      await errorLoggingService.logError({
        message: getErrorMessage(error),
        severity: 'high',
        metadata: {
          context: 'QuoteService.createQuote',
          reference,
        },
      });
      throw error;
    }
  }
}

// Export singleton instance
export const quoteService = new QuoteService();
