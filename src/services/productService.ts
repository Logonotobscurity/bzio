
import * as staticRepo from '@/repositories/static/productRepository';
import * as brandRepo from '@/repositories/static/brandRepository';
import * as categoryRepo from '@/repositories/static/categoryRepository';
import * as companyRepo from '@/repositories/static/companyRepository';
import { Product, Brand, Category, Company } from '@/lib/schema';
import { bestSellers } from '@/lib/db/best-sellers';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

const repo = staticRepo;

// Types for Company Directory
export interface CompanySpecialty {
  categorySlug: string;
  categoryName: string;
  productCount: number;
  brandCount: number;
}

export interface CompanyDirectoryData extends Company {
  specialties: CompanySpecialty[];
  strongestCategory: string | null;
  productCount: number;
  brandCount: number;
  positioningStatement?: string;
  buyerSegments?: string[];
}

// Types for Brands Page Redesign
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

// --- NEW TYPES FOR CATEGORY PAGE -- -
export interface EnrichedCategoryData extends Category {
  productCount: number;
  brandCount: number;
  inStockCount: number;
  priceRange: { min: number; max: number };
  topBrands: { name: string; productCount: number }[];
  bestSellers: Product[];
  bulkProductCount: number;
}

// --- EXISTING FUNCTIONS ---

export const getAllProducts = async (): Promise<Product[]> => {
    const cached = await cache.get<Product[]>(CACHE_KEYS.products());
    if (cached) return cached;

    const products = await repo.all();
    await cache.set(CACHE_KEYS.products(), products, CACHE_TTL.medium);
    return products;
};

export const getBestSellers = async (): Promise<Product[]> => {
    return bestSellers;
}

export const getProductBySku = async (sku: string): Promise<Product | undefined> => {
    return repo.findBySku(sku);
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    return repo.findBySlug(slug);
};

export const getProductsByBrand = async (brandSlug: string): Promise<Product[]> => {
    return repo.findByBrand(brandSlug);
};

export const getProductsByCategory = async (categorySlug: string): Promise<Product[]> => {
    return repo.findByCategory(categorySlug);
};

export const getProductsByCompanySlug = async (slug: string): Promise<Product[]> => {
    const company = await getCompanyBySlug(slug);
    if (!company) return [];

    const allBrands = await brandRepo.all();
    const companyBrandNames = allBrands
        .filter(b => b.companyId === company.id)
        .map(b => b.name);

    const allProducts = await repo.all();
    return allProducts.filter(p => companyBrandNames.includes(p.brand));
};

export const searchProducts = async (query: string): Promise<Product[]> => {
    return repo.search(query);
};

export const getBrandStats = async () => {
    return repo.getBrandStats();
};

export const getCategoryStats = async () => {
    return repo.getCategoryStats();
};

export const getBrands = async (): Promise<Brand[]> => {
    const cached = await cache.get<Brand[]>(CACHE_KEYS.brands);
    if (cached) return cached;

    const brands = await brandRepo.all();
    await cache.set(CACHE_KEYS.brands, brands, CACHE_TTL.long);
    return brands;
};

export const getBrandsByCompanyId = async (companyId: number): Promise<Brand[]> => {
    const allBrands = await brandRepo.all();
    const companyBrands = allBrands.filter(b => b.companyId === companyId);
    const allProducts = await repo.all();

    return companyBrands.map(brand => {
        const brandProducts = allProducts.filter(p => p.brand === brand.name);
        const categorySlugs = brandProducts.map(p => p.categorySlug);
        const uniqueCategories = [...new Set(categorySlugs)];
        const newBrand: Brand = {
            ...brand,
            productCount: brandProducts.length,
            categoryCount: uniqueCategories.length
        };
        return newBrand;
    });
};

export const getCategoriesByCompanyId = async (companyId: number): Promise<Category[]> => {
    const allBrands = await brandRepo.all();
    const companyBrandNames = allBrands
        .filter(b => b.companyId === companyId)
        .map(b => b.name);

    const allProducts = await repo.all();
    const companyProducts = allProducts.filter(p => companyBrandNames.includes(p.brand));
    
    const categorySlugs = [...new Set(companyProducts.map(p => p.categorySlug))];
    const allCategories = await categoryRepo.all();
    
    const categoriesWithCounts: Category[] = [];

    for (const slug of categorySlugs) {
        const category = allCategories.find(c => c.slug === slug);
        if (category) {
            const categoryProducts = companyProducts.filter(p => p.categorySlug === slug);
            const brandNames = [...new Set(categoryProducts.map(p => p.brand))];
            
            categoriesWithCounts.push({
                ...category,
                productCount: categoryProducts.length,
                brandCount: brandNames.length,
            });
        }
    }
    
    return categoriesWithCounts;
};

export const getCategories = async (): Promise<Category[]> => {
    const cached = await cache.get<Category[]>(CACHE_KEYS.categories);
    if (cached) return cached;

    const categories = await categoryRepo.all();
    await cache.set(CACHE_KEYS.categories, categories, CACHE_TTL.long);
    return categories;
};

export const getCompanies = async (): Promise<CompanyDirectoryData[]> => {
    const cached = await cache.get<CompanyDirectoryData[]>(CACHE_KEYS.companies);
    if (cached) return cached;

    const [companies, allProducts, allBrands, allCategories] = await Promise.all([
        companyRepo.all(),
        staticRepo.all(),
        brandRepo.all(),
        categoryRepo.all()
    ]);

    const categoryMap = new Map(allCategories.map(c => [c.slug, c.name]));

    const enrichedCompanies = companies.map(company => {
        const companyBrands = allBrands.filter(b => b.companyId === company.id);
        const companyBrandNames = companyBrands.map(b => b.name);
        const companyProducts = allProducts.filter(p => companyBrandNames.includes(p.brand));

        const productsByCategory: Record<string, Product[]> = {};
        for (const product of companyProducts) {
            if (!productsByCategory[product.categorySlug]) {
                productsByCategory[product.categorySlug] = [];
            }
            productsByCategory[product.categorySlug].push(product);
        }

        const specialties: CompanySpecialty[] = Object.keys(productsByCategory).map(categorySlug => {
            const products = productsByCategory[categorySlug];
            const brandNames = new Set(products.map(p => p.brand));
            return {
                categorySlug,
                categoryName: categoryMap.get(categorySlug) || 'Unknown Category',
                productCount: products.length,
                brandCount: brandNames.size
            };
        });

        specialties.sort((a, b) => b.productCount - a.productCount);

        const strongestCategory = specialties.length > 0 ? specialties[0].categoryName : null;

        return {
            ...company,
            productCount: companyProducts.length,
            brandCount: companyBrands.length,
            specialties,
            strongestCategory
        };
    });

    await cache.set(CACHE_KEYS.companies, enrichedCompanies, CACHE_TTL.long);
    return enrichedCompanies;
};

export const getCompanyBySlug = async (slug: string): Promise<Company | undefined> => {
    const allCompanies = await companyRepo.all();
    return allCompanies.find(c => c.slug === slug);
};

// --- NEW FUNCTION FOR CATEGORIES PAGE ---
export const getCategoryPageData = async (): Promise<EnrichedCategoryData[]> => {
    const [products, categories] = await Promise.all([
      repo.all(),
      categoryRepo.all(),
    ]);
  
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

// --- NEW FUNCTION FOR BRANDS PAGE ---

export const getBrandsPageData = async (): Promise<CategorizedBrandGroup[]> => {
    const [products, brands, companies, categories] = await Promise.all([
        repo.all(),
        brandRepo.all(),
        companyRepo.all(),
        categoryRepo.all(),
    ]);

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

// --- EXISTING PRODUCT PAGE DATA FUNCTION ---

interface ProductPageData {
    product: Product;
    brand: Brand;
    category: Category;
    company?: Company;
    relatedProducts: Product[];
}

export const getProductPageData = async (slug: string): Promise<ProductPageData | null> => {
    const product = await repo.findBySlug(slug);
    if (!product) {
        console.error(`Product with slug '${slug}' not found.`);
        return null;
    }

    const allBrands = await brandRepo.all();
    const brand = allBrands.find(b => b.name === product.brand);

    if (!brand) {
        console.error(`Brand '${product.brand}' for product '${slug}' not found.`);
        return null; 
    }

    const category = await categoryRepo.findBySlug(product.categorySlug);
    if (!category) {
        console.error(`Category with slug '${product.categorySlug}' for product '${slug}' not found.`);
        return null; 
    }

    let company: Company | undefined;
    if (brand && brand.companyId) {
        company = await companyRepo.findById(brand.companyId);
    }

    const relatedProducts = (await repo.findByCategory(product.categorySlug))
        .filter(p => p.id !== product.id)
        .slice(0, 3); 

    return {
        product,
        brand,
        category,
        company,
        relatedProducts,
    };
};
