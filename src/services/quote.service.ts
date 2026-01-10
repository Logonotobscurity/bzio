/**
 * Quote Service
 * 
 * Business logic layer for Quote operations
 * Handles quote management, validation, and workflows
 */

import { QuoteRepository } from '@/repositories';
import { errorLoggingService } from './error-logging.service';

const quoteRepository = new QuoteRepository();

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
      await errorLoggingService.logError(error, {
        context: 'QuoteService.getAllQuotes',
        severity: 'error',
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
      await errorLoggingService.logError(error, {
        context: 'QuoteService.getQuoteById',
        quoteId: String(id),
        severity: 'warn',
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
      await errorLoggingService.logError(error, {
        context: 'QuoteService.getQuoteByReference',
        reference,
        severity: 'warn',
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
      await errorLoggingService.logError(error, {
        context: 'QuoteService.updateQuote',
        quoteId: String(id),
        updates: JSON.stringify(updates),
        severity: 'error',
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
      await errorLoggingService.logError(error, {
        context: 'QuoteService.deleteQuote',
        quoteId: String(id),
        severity: 'error',
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
      await errorLoggingService.logError(error, {
        context: 'QuoteService.getUserQuotes',
        userId,
        severity: 'error',
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
      await errorLoggingService.logError(error, {
        context: 'QuoteService.getQuotesByStatus',
        status,
        severity: 'error',
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
      await errorLoggingService.logError(error, {
        context: 'QuoteService.getQuoteCount',
        status,
        severity: 'warn',
      });
      throw error;
    }
  }

  /**
   * Create a new quote
   */
  async createQuote(data: {
    reference: string;
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
    try {
      if (!data.reference || !data.buyerContactEmail || !data.lines) {
        throw new Error('Quote reference, email, and line items are required');
      }

      const quote = await quoteRepository.create({
        reference: data.reference,
        buyerContactEmail: data.buyerContactEmail,
        buyerContactPhone: data.buyerContactPhone,
        buyerCompanyId: data.buyerCompanyId,
        status: data.status || 'draft',
        lines: data.lines,
      });

      return quote;
    } catch (error) {
      await errorLoggingService.logError(error, {
        context: 'QuoteService.createQuote',
        reference: data.reference,
        severity: 'error',
      });
      throw error;
    }
  }
}

// Export singleton instance
export const quoteService = new QuoteService();
