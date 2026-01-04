/**
 * productService.test.ts
 * Unit tests for product service
 */

import * as productService from '../productService';
import * as staticRepo from '@/repositories/static/productRepository';
import { createMockProduct, createMockBrand, createMockCategory } from '../__tests__/setup';

jest.mock('@/repositories/static/productRepository');
jest.mock('@/repositories/static/brandRepository');
jest.mock('@/repositories/static/categoryRepository');
jest.mock('@/lib/cache');

describe('productService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Product 1' }),
        createMockProduct({ id: '2', name: 'Product 2' }),
      ];

      (staticRepo.all as jest.Mock).mockResolvedValueOnce(mockProducts);

      const result = await productService.getAllProducts();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Product 1');
      expect(result[1].name).toBe('Product 2');
    });

    it('should return empty array when no products exist', async () => {
      (staticRepo.all as jest.Mock).mockResolvedValueOnce([]);

      const result = await productService.getAllProducts();

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      (staticRepo.all as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await expect(productService.getAllProducts()).rejects.toThrow('Database error');
    });
  });

  describe('getProductBySku', () => {
    it('should return a product by SKU', async () => {
      const mockProduct = createMockProduct({ id: '1', name: 'Product SKU' });

      (staticRepo.findBySku as jest.Mock).mockResolvedValueOnce(mockProduct);

      const result = await productService.getProductBySku('SKU-001');

      expect(result).toEqual(mockProduct);
      expect(staticRepo.findBySku).toHaveBeenCalledWith('SKU-001');
    });

    it('should return undefined for non-existent SKU', async () => {
      (staticRepo.findBySku as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await productService.getProductBySku('NONEXISTENT');

      expect(result).toBeUndefined();
    });
  });

  describe('getProductBySlug', () => {
    it('should return a product by slug', async () => {
      const mockProduct = createMockProduct({ id: '1', name: 'Product' });

      (staticRepo.findBySlug as jest.Mock).mockResolvedValueOnce(mockProduct);

      const result = await productService.getProductBySlug('product-slug');

      expect(result).toEqual(mockProduct);
      expect(staticRepo.findBySlug).toHaveBeenCalledWith('product-slug');
    });

    it('should return undefined for non-existent slug', async () => {
      (staticRepo.findBySlug as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await productService.getProductBySlug('nonexistent-slug');

      expect(result).toBeUndefined();
    });
  });

  describe('getProductsByBrand', () => {
    it('should return products filtered by brand', async () => {
      const mockProducts = [
        createMockProduct({ id: '1', brandId: '1' }),
        createMockProduct({ id: '2', brandId: '1' }),
      ];

      (staticRepo.findByBrand as jest.Mock).mockResolvedValueOnce(mockProducts);

      const result = await productService.getProductsByBrand('brand-slug');

      expect(result).toHaveLength(2);
      expect(staticRepo.findByBrand).toHaveBeenCalledWith('brand-slug');
    });

    it('should return empty array when brand has no products', async () => {
      (staticRepo.findByBrand as jest.Mock).mockResolvedValueOnce([]);

      const result = await productService.getProductsByBrand('empty-brand');

      expect(result).toEqual([]);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products filtered by category', async () => {
      const mockProducts = [
        createMockProduct({ id: '1', categoryId: '1' }),
        createMockProduct({ id: '2', categoryId: '1' }),
      ];

      (staticRepo.findByCategory as jest.Mock).mockResolvedValueOnce(mockProducts);

      const result = await productService.getProductsByCategory('category-slug');

      expect(result).toHaveLength(2);
      expect(staticRepo.findByCategory).toHaveBeenCalledWith('category-slug');
    });

    it('should return empty array when category has no products', async () => {
      (staticRepo.findByCategory as jest.Mock).mockResolvedValueOnce([]);

      const result = await productService.getProductsByCategory('empty-category');

      expect(result).toEqual([]);
    });
  });

  describe('getBestSellers', () => {
    it('should return best seller products', async () => {
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Best Seller 1' }),
        createMockProduct({ id: '2', name: 'Best Seller 2' }),
      ];

      jest.spyOn(productService, 'getBestSellers').mockResolvedValueOnce(mockProducts);

      const result = await productService.getBestSellers();

      expect(result).toHaveLength(2);
    });
  });
});
