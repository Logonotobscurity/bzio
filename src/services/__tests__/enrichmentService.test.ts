/**
 * Enrichment Service Tests
 * Tests for product, brand, and category enrichment functions
 */

import { enrichCategories, enrichBrands } from '@/services/enrichmentService';
import { Product, Brand, Category, Company } from '@/lib/schema';

// Mock data factories
const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  name: 'Test Product',
  slug: 'test-product',
  sku: 'SKU123',
  description: 'Test description',
  price: 1000,
  imageUrl: 'https://example.com/image.jpg',
  brand: 'Test Brand',
  categorySlug: 'test-category',
  categoryId: 1,
  unit: 'piece',
  moq: 1,
  isFeatured: false,
  inStock: true,
  rating: 4.5,
  ...overrides,
});

const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 1,
  name: 'Test Category',
  slug: 'test-category',
  description: 'Test category description',
  imageUrl: 'https://example.com/cat.jpg',
  ...overrides,
});

const createMockBrand = (overrides: Partial<Brand> = {}): Brand => ({
  id: 'brand-1',
  name: 'Test Brand',
  slug: 'test-brand',
  imageUrl: 'https://example.com/brand.jpg',
  isFeatured: false,
  companyId: 1,
  ...overrides,
});

const createMockCompany = (overrides: Partial<Company> = {}): Company => ({
  id: 1,
  name: 'Test Company',
  slug: 'test-company',
  description: 'Test company',
  imageUrl: 'https://example.com/company.jpg',
  websiteUrl: 'https://example.com',
  ...overrides,
});

describe('enrichmentService', () => {
  describe('enrichCategories', () => {
    it('should enrich categories with product counts', async () => {
      const products = [
        createMockProduct({ categorySlug: 'electronics' }),
        createMockProduct({ categorySlug: 'electronics' }),
        createMockProduct({ categorySlug: 'clothing' }),
      ];

      const categories = [
        createMockCategory({ slug: 'electronics', name: 'Electronics' }),
        createMockCategory({ slug: 'clothing', name: 'Clothing' }),
      ];

      const result = await enrichCategories(products, categories);

      expect(result).toHaveLength(2);
      expect(result[0].productCount).toBe(2);
      expect(result[1].productCount).toBe(1);
    });

    it('should calculate price range correctly', async () => {
      const products = [
        createMockProduct({ price: 100, categorySlug: 'test' }),
        createMockProduct({ price: 500, categorySlug: 'test' }),
        createMockProduct({ price: 1000, categorySlug: 'test' }),
      ];

      const categories = [createMockCategory({ slug: 'test' })];

      const result = await enrichCategories(products, categories);

      expect(result[0].priceRange.min).toBe(100);
      expect(result[0].priceRange.max).toBe(1000);
    });

    it('should count in-stock products', async () => {
      const products = [
        createMockProduct({ inStock: true, categorySlug: 'test' }),
        createMockProduct({ inStock: false, categorySlug: 'test' }),
        createMockProduct({ inStock: true, categorySlug: 'test' }),
      ];

      const categories = [createMockCategory({ slug: 'test' })];

      const result = await enrichCategories(products, categories);

      expect(result[0].inStockCount).toBe(2);
    });

    it('should count unique brands', async () => {
      const products = [
        createMockProduct({ brand: 'Brand A', categorySlug: 'test' }),
        createMockProduct({ brand: 'Brand B', categorySlug: 'test' }),
        createMockProduct({ brand: 'Brand A', categorySlug: 'test' }),
      ];

      const categories = [createMockCategory({ slug: 'test' })];

      const result = await enrichCategories(products, categories);

      expect(result[0].brandCount).toBe(2);
    });

    it('should identify top brands by product count', async () => {
      const products = [
        createMockProduct({ brand: 'Brand A', categorySlug: 'test' }),
        createMockProduct({ brand: 'Brand A', categorySlug: 'test' }),
        createMockProduct({ brand: 'Brand B', categorySlug: 'test' }),
        createMockProduct({ brand: 'Brand C', categorySlug: 'test' }),
        createMockProduct({ brand: 'Brand C', categorySlug: 'test' }),
        createMockProduct({ brand: 'Brand C', categorySlug: 'test' }),
      ];

      const categories = [createMockCategory({ slug: 'test' })];

      const result = await enrichCategories(products, categories);

      expect(result[0].topBrands).toHaveLength(3);
      expect(result[0].topBrands[0].name).toBe('Brand C');
      expect(result[0].topBrands[0].productCount).toBe(3);
    });

    it('should identify best sellers by featured and rating', async () => {
      const products = [
        createMockProduct({ isFeatured: true, rating: 3, categorySlug: 'test' }),
        createMockProduct({ isFeatured: false, rating: 5, categorySlug: 'test' }),
        createMockProduct({ isFeatured: true, rating: 4, categorySlug: 'test' }),
      ];

      const categories = [createMockCategory({ slug: 'test' })];

      const result = await enrichCategories(products, categories);

      expect(result[0].bestSellers).toHaveLength(3);
      // Featured items should come first
      expect(result[0].bestSellers[0].isFeatured).toBe(true);
    });

    it('should count bulk products (MOQ > 10)', async () => {
      const products = [
        createMockProduct({ moq: 5, categorySlug: 'test' }),
        createMockProduct({ moq: 15, categorySlug: 'test' }),
        createMockProduct({ moq: 20, categorySlug: 'test' }),
      ];

      const categories = [createMockCategory({ slug: 'test' })];

      const result = await enrichCategories(products, categories);

      expect(result[0].bulkProductCount).toBe(2);
    });

    it('should handle categories with no products', async () => {
      const products = [createMockProduct({ categorySlug: 'other' })];
      const categories = [createMockCategory({ slug: 'test' })];

      const result = await enrichCategories(products, categories);

      expect(result[0].productCount).toBe(0);
      expect(result[0].brandCount).toBe(0);
      expect(result[0].priceRange.min).toBe(0);
      expect(result[0].priceRange.max).toBe(0);
    });
  });

  describe('enrichBrands', () => {
    it('should enrich brands with product counts', async () => {
      const products = [
        createMockProduct({ brand: 'Brand A' }),
        createMockProduct({ brand: 'Brand A' }),
        createMockProduct({ brand: 'Brand B' }),
      ];

      const brands = [
        createMockBrand({ name: 'Brand A' }),
        createMockBrand({ name: 'Brand B' }),
      ];

      const companies = [createMockCompany()];
      const categories = [createMockCategory()];

      const result = await enrichBrands(products, brands, companies, categories);

      expect(result).toHaveLength(2);
      const brandAGroup = result.find(g => g.brands.some(b => b.name === 'Brand A'));
      const brandAData = brandAGroup?.brands.find(b => b.name === 'Brand A');
      expect(brandAData?.productCount).toBe(2);
    });

    it('should calculate price range per brand', async () => {
      const products = [
        createMockProduct({ brand: 'Brand A', price: 100 }),
        createMockProduct({ brand: 'Brand A', price: 500 }),
      ];

      const brands = [createMockBrand({ name: 'Brand A' })];
      const companies = [createMockCompany()];
      const categories = [createMockCategory()];

      const result = await enrichBrands(products, brands, companies, categories);

      const brandData = result[0].brands[0];
      expect(brandData.priceRange.min).toBe(100);
      expect(brandData.priceRange.max).toBe(500);
    });

    it('should identify primary category', async () => {
      const products = [
        createMockProduct({ brand: 'Brand A', categorySlug: 'electronics' }),
        createMockProduct({ brand: 'Brand A', categorySlug: 'electronics' }),
        createMockProduct({ brand: 'Brand A', categorySlug: 'clothing' }),
      ];

      const brands = [createMockBrand({ name: 'Brand A' })];
      const companies = [createMockCompany()];
      const categories = [
        createMockCategory({ slug: 'electronics', name: 'Electronics' }),
        createMockCategory({ slug: 'clothing', name: 'Clothing' }),
      ];

      const result = await enrichBrands(products, brands, companies, categories);

      const brandData = result[0].brands[0];
      expect(brandData.primaryCategory).toBe('Electronics');
    });

    it('should map company information', async () => {
      const products = [createMockProduct({ brand: 'Brand A' })];
      const brands = [createMockBrand({ name: 'Brand A', companyId: 1 })];
      const companies = [createMockCompany({ id: 1, name: 'Test Corp' })];
      const categories = [createMockCategory()];

      const result = await enrichBrands(products, brands, companies, categories);

      const brandData = result[0].brands[0];
      expect(brandData.companyName).toBe('Test Corp');
    });

    it('should collect pack sizes', async () => {
      const products = [
        createMockProduct({ brand: 'Brand A', unit: 'kg' }),
        createMockProduct({ brand: 'Brand A', unit: 'kg' }),
        createMockProduct({ brand: 'Brand A', unit: 'liter' }),
      ];

      const brands = [createMockBrand({ name: 'Brand A' })];
      const companies = [createMockCompany()];
      const categories = [createMockCategory()];

      const result = await enrichBrands(products, brands, companies, categories);

      const brandData = result[0].brands[0];
      expect(brandData.packSizes).toContain('kg');
      expect(brandData.packSizes).toContain('liter');
    });

    it('should group brands by primary category', async () => {
      const products = [
        createMockProduct({ brand: 'Brand A', categorySlug: 'electronics' }),
        createMockProduct({ brand: 'Brand B', categorySlug: 'clothing' }),
      ];

      const brands = [
        createMockBrand({ name: 'Brand A' }),
        createMockBrand({ name: 'Brand B' }),
      ];

      const companies = [createMockCompany()];
      const categories = [
        createMockCategory({ slug: 'electronics', name: 'Electronics' }),
        createMockCategory({ slug: 'clothing', name: 'Clothing' }),
      ];

      const result = await enrichBrands(products, brands, companies, categories);

      expect(result).toHaveLength(2);
      const electronicsGroup = result.find(g => g.categoryName === 'Electronics');
      const clothingGroup = result.find(g => g.categoryName === 'Clothing');
      
      expect(electronicsGroup?.brands).toHaveLength(1);
      expect(clothingGroup?.brands).toHaveLength(1);
    });

    it('should exclude brands with no products', async () => {
      const products = [createMockProduct({ brand: 'Brand A' })];
      const brands = [
        createMockBrand({ name: 'Brand A' }),
        createMockBrand({ name: 'Brand B' }),
      ];

      const companies = [createMockCompany()];
      const categories = [createMockCategory()];

      const result = await enrichBrands(products, brands, companies, categories);

      const allBrands = result.flatMap(g => g.brands);
      expect(allBrands).toHaveLength(1);
      expect(allBrands[0].name).toBe('Brand A');
    });

    it('should sort brands by product count within categories', async () => {
      const products = [
        createMockProduct({ brand: 'Brand A', categorySlug: 'test' }),
        createMockProduct({ brand: 'Brand A', categorySlug: 'test' }),
        createMockProduct({ brand: 'Brand B', categorySlug: 'test' }),
      ];

      const brands = [
        createMockBrand({ name: 'Brand A' }),
        createMockBrand({ name: 'Brand B' }),
      ];

      const companies = [createMockCompany()];
      const categories = [createMockCategory({ slug: 'test' })];

      const result = await enrichBrands(products, brands, companies, categories);

      expect(result[0].brands[0].name).toBe('Brand A');
      expect(result[0].brands[1].name).toBe('Brand B');
    });

    it('should sort categories by total brand products', async () => {
      const products = [
        createMockProduct({ brand: 'Brand A', categorySlug: 'electronics' }),
        createMockProduct({ brand: 'Brand B', categorySlug: 'clothing' }),
        createMockProduct({ brand: 'Brand C', categorySlug: 'clothing' }),
      ];

      const brands = [
        createMockBrand({ name: 'Brand A' }),
        createMockBrand({ name: 'Brand B' }),
        createMockBrand({ name: 'Brand C' }),
      ];

      const companies = [createMockCompany()];
      const categories = [
        createMockCategory({ slug: 'electronics', name: 'Electronics' }),
        createMockCategory({ slug: 'clothing', name: 'Clothing' }),
      ];

      const result = await enrichBrands(products, brands, companies, categories);

      // Clothing should come first (2 brands) vs Electronics (1 brand)
      expect(result[0].categoryName).toBe('Clothing');
      expect(result[1].categoryName).toBe('Electronics');
    });
  });
});
