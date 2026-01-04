/**
 * pricing.test.ts
 * Unit tests for pricing service
 */

import * as pricingService from '../pricing';
import { createMockProduct } from '../__tests__/setup';

describe('pricingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculatePrice', () => {
    it('should calculate basic price without discount', async () => {
      const product = createMockProduct({ price: 100 });
      const result = await pricingService.calculatePrice(product, 5, 0);

      expect(result).toBe(500); // 100 * 5
    });

    it('should calculate price with discount', async () => {
      const product = createMockProduct({ price: 100 });
      const result = await pricingService.calculatePrice(product, 5, 10); // 10% discount

      expect(result).toBe(450); // 500 - 50
    });

    it('should handle zero quantity', async () => {
      const product = createMockProduct({ price: 100 });
      const result = await pricingService.calculatePrice(product, 0, 0);

      expect(result).toBe(0);
    });

    it('should handle 100% discount', async () => {
      const product = createMockProduct({ price: 100 });
      const result = await pricingService.calculatePrice(product, 5, 100);

      expect(result).toBe(0);
    });

    it('should handle null product', async () => {
      const result = await pricingService.calculatePrice(null as any, 5, 0);
      expect(result).toBe(0);
    });

    it('should handle negative quantity gracefully', async () => {
      const product = createMockProduct({ price: 100 });
      const result = await pricingService.calculatePrice(product, -5, 0);

      expect(result).toBe(0);
    });
  });

  describe('calculateBulkPrice', () => {
    it('should calculate bulk price without discount', async () => {
      const items = [
        { price: 100, quantity: 5 },
        { price: 200, quantity: 3 },
      ];

      const result = await pricingService.calculateBulkPrice(items, 0);

      expect(result).toBe(1100); // (100*5) + (200*3)
    });

    it('should calculate bulk price with discount', async () => {
      const items = [
        { price: 100, quantity: 5 },
        { price: 200, quantity: 3 },
      ];

      const result = await pricingService.calculateBulkPrice(items, 10); // 10% discount

      expect(result).toBe(990); // 1100 - 110
    });

    it('should handle empty items array', async () => {
      const result = await pricingService.calculateBulkPrice([], 0);
      expect(result).toBe(0);
    });

    it('should handle null items array', async () => {
      const result = await pricingService.calculateBulkPrice(null as any, 0);
      expect(result).toBe(0);
    });

    it('should handle multiple items', async () => {
      const items = [
        { price: 50, quantity: 2 },
        { price: 75, quantity: 4 },
        { price: 100, quantity: 1 },
      ];

      const result = await pricingService.calculateBulkPrice(items, 0);

      expect(result).toBe(600); // (50*2) + (75*4) + (100*1)
    });
  });

  describe('formatPrice', () => {
    it('should format price as USD currency', () => {
      const result = pricingService.formatPrice(1234.5);
      expect(result).toMatch(/\$1,234\.50/);
    });

    it('should handle zero price', () => {
      const result = pricingService.formatPrice(0);
      expect(result).toMatch(/\$0\.00/);
    });

    it('should handle large prices', () => {
      const result = pricingService.formatPrice(999999.99);
      expect(result).toMatch(/\$999,999\.99/);
    });

    it('should format with custom currency', () => {
      const result = pricingService.formatPrice(1000, 'EUR');
      expect(result).toMatch(/€|EUR/);
    });
  });

  describe('calculatePerUnitPrice', () => {
    it('should calculate per unit price', () => {
      const result = pricingService.calculatePerUnitPrice(500, 5);
      expect(result).toBe(100);
    });

    it('should handle single unit', () => {
      const result = pricingService.calculatePerUnitPrice(100, 1);
      expect(result).toBe(100);
    });

    it('should handle zero quantity', () => {
      const result = pricingService.calculatePerUnitPrice(100, 0);
      expect(result).toBe(0);
    });

    it('should handle fractional prices', () => {
      const result = pricingService.calculatePerUnitPrice(999, 3);
      expect(result).toBeCloseTo(333, 1);
    });
  });

  describe('qualifiesForBulkDiscount', () => {
    it('should return true when quantity meets MOQ', () => {
      const result = pricingService.qualifiesForBulkDiscount(10, 5);
      expect(result).toBe(true);
    });

    it('should return true when quantity equals MOQ', () => {
      const result = pricingService.qualifiesForBulkDiscount(5, 5);
      expect(result).toBe(true);
    });

    it('should return false when quantity below MOQ', () => {
      const result = pricingService.qualifiesForBulkDiscount(3, 5);
      expect(result).toBe(false);
    });

    it('should handle zero MOQ', () => {
      const result = pricingService.qualifiesForBulkDiscount(5, 0);
      expect(result).toBe(true);
    });
  });

  describe('calculateSavings', () => {
    it('should calculate savings correctly', () => {
      const result = pricingService.calculateSavings(100, 10);
      expect(result).toBe(10);
    });

    it('should handle 0% discount', () => {
      const result = pricingService.calculateSavings(100, 0);
      expect(result).toBe(0);
    });

    it('should handle 100% discount', () => {
      const result = pricingService.calculateSavings(100, 100);
      expect(result).toBe(100);
    });

    it('should handle fractional percentages', () => {
      const result = pricingService.calculateSavings(100, 15.5);
      expect(result).toBeCloseTo(15.5, 1);
    });
  });
});
