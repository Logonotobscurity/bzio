/**
 * Enrichment Service
 * Handles enriching product, brand, and category data with computed fields
 * Extracted from productService to follow single responsibility principle
 */

import * as staticRepo from '@/repositories/static/productRepository';
import * as brandRepo from '@/repositories/static/brandRepository';
import * as categoryRepo from '@/repositories/static/categoryRepository';
import * as companyRepo from '@/repositories/static/companyRepository';
import { Product, Brand, Category, Company } from '@/lib/schema';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// Types for enrichment
export interface EnrichedBrandData {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  isFeatured: boolean;
  brand_description?: string;
  companyId?: number;
  categoryCount?: number;
  companyName: string | null;
  companySlug: string | null;
  productCount: number;
  categories: { name: string, slug: string }[];
  priceRange: { min: number, max: number };
  packSizes: string[];
  primaryCategory: string;
}

export interface CategorizedBrandGroup {
  categoryName: string;
  brands: EnrichedBrandData[];
}

export interface EnrichedCategoryData extends Category {
  productCount: number;
  brandCount: number;
  inStockCount: number;
  priceRange: { min: number; max: number };
  topBrands: { name: string; productCount: number }[];
  bestSellers: Product[];
  bulkProductCount: number;
}

/**
 * Enrich category data with computed fields
 * @param products - All products
 * @param categories - All categories
 * @returns Enriched category data with stats and related products
 */
export const enrichCategories = async (
  products: Product[],
  categories: Category[]
): Promise<EnrichedCategoryData[]> => {
  return categories.map(category => {
    const categoryProducts = products.filter(p => p.categorySlug === category.slug);
    const productCount = categoryProducts.length;
    const brandCount = new Set(categoryProducts.map(p => p.brand)).size;
    const inStockCount = categoryProducts.filter(p => p.inStock).length;

    const prices = categoryProducts.map(p => p.price ?? 0).filter(p => p > 0);
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    };

    const brandCounts: Record<string, number> = {};
    categoryProducts.forEach(p => {
      brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });

    const topBrands = Object.entries(brandCounts)
      .map(([name, productCount]) => ({ name, productCount }))
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 3);

    const bestSellers = [...categoryProducts]
      .sort((a, b) => (b.isFeatured ? 1 : -1) - (a.isFeatured ? 1 : -1) || (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 3);

    const bulkProductCount = categoryProducts.filter(p => (p.moq ?? 0) > 10).length;

    return {
      ...category,
      productCount,
      brandCount,
      inStockCount,
      priceRange,
      topBrands,
      bestSellers,
      bulkProductCount,
    };
  });
};

/**
 * Enrich brand data with computed fields
 * @param products - All products
 * @param brands - All brands
 * @param companies - All companies
 * @param categories - All categories
 * @returns Enriched brand data grouped by category
 */
export const enrichBrands = async (
  products: Product[],
  brands: Brand[],
  companies: Company[],
  categories: Category[]
): Promise<CategorizedBrandGroup[]> => {
  const companyMap = new Map(companies.map(c => [c.id, c]));
  const categoryMap = new Map(categories.map(c => [c.slug, c]));

  const enrichedBrands: EnrichedBrandData[] = brands.map(brand => {
    const company = brand.companyId ? companyMap.get(brand.companyId) : null;
    const brandProducts = products.filter(p => p.brand === brand.name);

    if (brandProducts.length === 0) {
      return null;
    }

    const categoryCounts: Record<string, number> = {};
    brandProducts.forEach(p => {
      categoryCounts[p.categorySlug] = (categoryCounts[p.categorySlug] || 0) + 1;
    });

    const primaryCategorySlug = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
    const primaryCategory = categoryMap.get(primaryCategorySlug)?.name || 'General';

    const brandCategories = [...new Set(brandProducts.map(p => p.categorySlug))]
      .map(slug => categoryMap.get(slug))
      .filter(Boolean) as Category[];

    const prices = brandProducts.map(p => p.price ?? 0).filter(p => p > 0);
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    };

    const packSizes = [...new Set(brandProducts.map(p => p.unit ?? ''))];

    return {
      ...brand,
      companyName: company?.name || null,
      companySlug: company?.slug || null,
      productCount: brandProducts.length,
      categories: brandCategories.map(c => ({ name: c.name, slug: c.slug })),
      priceRange,
      packSizes,
      primaryCategory,
    };
  }).filter(Boolean) as EnrichedBrandData[];

  const groupedByCat: Record<string, EnrichedBrandData[]> = {};
  for (const brand of enrichedBrands) {
    if (!groupedByCat[brand.primaryCategory]) {
      groupedByCat[brand.primaryCategory] = [];
    }
    groupedByCat[brand.primaryCategory].push(brand);
  }

  return Object.keys(groupedByCat)
    .map(categoryName => ({
      categoryName,
      brands: groupedByCat[categoryName].sort((a, b) => b.productCount - a.productCount),
    }))
    .sort((a, b) => b.brands.reduce((sum, brand) => sum + brand.productCount, 0) - a.brands.reduce((sum, brand) => sum + brand.productCount, 0));
};

/**
 * Get enriched category page data
 */
export const getCategoryPageData = async (): Promise<EnrichedCategoryData[]> => {
  const [products, categories] = await Promise.all([
    staticRepo.all(),
    categoryRepo.all(),
  ]);

  return enrichCategories(products, categories);
};

/**
 * Get enriched brands page data
 */
export const getBrandsPageData = async (): Promise<CategorizedBrandGroup[]> => {
  const [products, brands, companies, categories] = await Promise.all([
    staticRepo.all(),
    brandRepo.all(),
    companyRepo.all(),
    categoryRepo.all(),
  ]);

  return enrichBrands(products, brands, companies, categories);
};
