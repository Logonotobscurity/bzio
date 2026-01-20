/**
 * quoteService.test.ts
 * Unit tests for quote service
 */

import * as quoteService from '../quoteService';
import { createMockPrismaClient, createMockQuote } from '../__tests__/setup';

jest.mock('@/lib/db', () => ({
  prisma: {
    $transaction: jest.fn(),
    quote: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    quoteEvent: {
      create: jest.fn(),
    },
  },
}));

describe('quoteService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = require('@/lib/db').prisma;
  });

  describe('createQuote', () => {
    it('should create a quote with lines and event in a transaction', async () => {
      const mockQuote = {
        id: '1',
        reference: 'Q-1234567890-1234',
        userId: 1,
        buyerContactEmail: 'buyer@example.com',
        buyerContactPhone: '1234567890',
        buyerCompanyId: 'company-1',
        status: "DRAFT",
        createdAt: new Date(),
        updatedAt: new Date(),
        lines: [
          {
            id: '1',
            quoteId: '1',
            productId: '1',
            productName: 'Product 1',
            productSku: 'SKU-001',
            qty: 10,
            unitPrice: 100,
            description: 'High quality product',
          },
        ],
      };

      const payload = {
        actorId: 'user-1',
        userId: 1,
        buyerContactEmail: 'buyer@example.com',
        buyerContactPhone: '1234567890',
        buyerCompanyId: 'company-1',
        lines: [
          {
            productId: '1',
            productName: 'Product 1',
            productSku: 'SKU-001',
            qty: 10,
            unitPrice: 100,
            description: 'High quality product',
          },
        ],
      };

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
        const tx = {
          quote: {
            create: jest.fn().mockResolvedValue(mockQuote),
          },
          quoteEvent: {
            create: jest.fn().mockResolvedValue({ id: '1' }),
          },
        };

        return callback(tx);
      });

      const result = await quoteService.createQuote(payload);

      expect(result).toEqual(mockQuote);
      expect(result.reference).toMatch(/^Q-\d+-\d+$/);
      expect(result.status).toBe('draft');
      expect(result.lines).toHaveLength(1);
    });

    it('should create a quote without actor ID', async () => {
      const mockQuote = createMockQuote({
        reference: 'Q-1234567890-1234',
        status: "DRAFT",
      });

      const payload = {
        userId: 1,
        buyerContactEmail: 'buyer@example.com',
        lines: [
          {
            productName: 'Product',
            qty: 5,
          },
        ],
      };

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
        const tx = {
          quote: {
            create: jest.fn().mockResolvedValue(mockQuote),
          },
          quoteEvent: {
            create: jest.fn().mockResolvedValue({ id: '1' }),
          },
        };

        return callback(tx);
      });

      const result = await quoteService.createQuote(payload as any);

      expect(result.status).toBe('draft');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should handle empty lines array', async () => {
      const payload = {
        userId: 1,
        buyerContactEmail: 'buyer@example.com',
        lines: [],
      };

      const mockQuote = createMockQuote({
        lines: [],
      });

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
        const tx = {
          quote: {
            create: jest.fn().mockResolvedValue(mockQuote),
          },
          quoteEvent: {
            create: jest.fn().mockResolvedValue({ id: '1' }),
          },
        };

        return callback(tx);
      });

      const result = await quoteService.createQuote(payload as any);

      expect(result.lines).toHaveLength(0);
    });

    it('should use system as default actor ID', async () => {
      const mockQuote = createMockQuote();

      const payload = {
        buyerContactEmail: 'buyer@example.com',
        lines: [
          {
            productName: 'Product',
            qty: 5,
          },
        ],
      };

      let txCallback: any;
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
        txCallback = callback;
        const tx = {
          quote: {
            create: jest.fn().mockResolvedValue(mockQuote),
          },
          quoteEvent: {
            create: jest.fn().mockResolvedValue({ id: '1' }),
          },
        };

        return callback(tx);
      });

      await quoteService.createQuote(payload as any);

      expect(txCallback).toBeDefined();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should handle database transaction errors', async () => {
      const payload = {
        userId: 1,
        buyerContactEmail: 'buyer@example.com',
        lines: [{ productName: 'Product', qty: 5 }],
      };

      (mockPrisma.$transaction as jest.Mock).mockRejectedValueOnce(
        new Error('Database transaction failed')
      );

      await expect(quoteService.createQuote(payload as any)).rejects.toThrow(
        'Database transaction failed'
      );
    });
  });
});
