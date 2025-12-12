import rawProducts from '@/lib/data/all-products.json';
import { Product } from '@/lib/schema';
import { normalizeProducts } from '@/lib/product-utils';

const products: Product[] = normalizeProducts(rawProducts as (Omit<Product, 'imageUrl'> & { imageUrl: string })[]);

const cache = {
  all: {
    data: [] as Product[],
    lastUpdated: 0,
  },
  slug: {} as Record<string, Product>,
  sku: {} as Record<string, Product>,
  brand: {} as Record<string, Product[]>,
  category: {} as Record<string, Product[]>,
};

const updateCache = (product: Product) => {
  cache.slug[product.slug] = product;
  cache.sku[product.sku] = product;
  if (!cache.brand[product.brand]) {
    cache.brand[product.brand] = [];
  }
  if (!cache.brand[product.brand].find(p => p.id === product.id)) {
    cache.brand[product.brand].push(product);
  }
  if (!cache.category[product.categorySlug]) {
    cache.category[product.categorySlug] = [];
  }
  if (!cache.category[product.categorySlug].find(p => p.id === product.id)) {
    cache.category[product.categorySlug].push(product);
  }
};

products.forEach((product) => {
  updateCache(product);
});

export const all = async (): Promise<Product[]> => {
  return products;
};

export const findBySlug = async (slug: string): Promise<Product | undefined> => {
  return products.find((p) => p.slug === slug);
};

export const findBySku = async (sku: string): Promise<Product | undefined> => {
  return products.find((p) => p.sku === sku);
};

export const findByBrand = async (brandSlug: string): Promise<Product[]> => {
  return products.filter((p) => p.brand === brandSlug);
};

export const findByCategory = async (categorySlug: string): Promise<Product[]> => {
  return products.filter((p) => p.categorySlug === categorySlug);
};

export const search = async (query: string): Promise<Product[]> => {
  return products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
};

export const getBrandStats = async () => {
  const brandStatsIntermediate: Record<string, { productCount: number; categories: Set<string> }> = {};
  for (const p of products) {
    if (!brandStatsIntermediate[p.brand]) {
      brandStatsIntermediate[p.brand] = { productCount: 0, categories: new Set() };
    }
    brandStatsIntermediate[p.brand].productCount++;
    brandStatsIntermediate[p.brand].categories.add(p.categorySlug);
  }

  const finalBrandStats: Record<string, { productCount: number; categoryCount: number }> = {};
  for (const brand in brandStatsIntermediate) {
    finalBrandStats[brand] = {
      productCount: brandStatsIntermediate[brand].productCount,
      categoryCount: brandStatsIntermediate[brand].categories.size,
    };
  }
  return finalBrandStats;
};

export const getCategoryStats = async () => {
  const categoryStats: Record<string, { productCount: number; brands: Set<string> }> = {};
  for (const product of products) {
    if (!categoryStats[product.categorySlug]) {
      categoryStats[product.categorySlug] = { productCount: 0, brands: new Set() };
    }
    categoryStats[product.categorySlug].productCount++;
    categoryStats[product.categorySlug].brands.add(product.brand);
  }

  const finalCategoryStats: Record<string, { productCount: number; brandCount: number }> = {};
  for (const categorySlug in categoryStats) {
    finalCategoryStats[categorySlug] = {
      productCount: categoryStats[categorySlug].productCount,
      brandCount: categoryStats[categorySlug].brands.size,
    };
  }
  return finalCategoryStats;
};
