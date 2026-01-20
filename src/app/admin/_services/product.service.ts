"use server";

import { prisma } from '@/lib/prisma';
import { getCachedQuery, CACHE_TTL, CACHE_KEYS, invalidateDashboardCache } from '@/lib/cache';
import { revalidatePath } from 'next/cache';

export interface ProductFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  stock?: 'in-stock' | 'low-stock' | 'out-of-stock' | 'all';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductCreateInput {
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  detailedDescription?: string;
  price: number;
  stockQuantity: number;
  unit?: string;
  brandId: number;
  categoryId: number;
  imageUrl?: string;
  images?: string[];
  tags?: string[];
  specifications?: Record<string, unknown>;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {
  id: number;
}

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

/**
 * Get product statistics with caching
 */
export async function getProductStats(): Promise<ProductStats> {
  return getCachedQuery(
    `${CACHE_KEYS.PRODUCTS_LIST}:stats`,
    async () => {
      const [total, active, inactive, lowStock, outOfStock, valueAgg] = await Promise.all([
        prisma.products.count(),
        prisma.products.count({ where: { isActive: true } }),
        prisma.products.count({ where: { isActive: false } }),
        prisma.products.count({ where: { stockQuantity: { gt: 0, lte: 10 } } }),
        prisma.products.count({ where: { stockQuantity: 0 } }),
        prisma.products.aggregate({
          _sum: { price: true },
          where: { isActive: true },
        }),
      ]);

      return {
        total,
        active,
        inactive,
        lowStock,
        outOfStock,
        totalValue: parseFloat(valueAgg._sum.price?.toString() || '0'),
      };
    },
    { ttl: CACHE_TTL.SHORT }
  );
}

/**
 * Get products with filters and pagination
 * Supports search across SKU, name, and description (case-insensitive)
 * Supports price range filtering with minPrice/maxPrice
 */
export async function getProducts(filters: ProductFilters = {}, page = 1, limit = 20) {
  const where: Record<string, unknown> = {};

  // Search across SKU, name, and description (case-insensitive)
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    where.OR = [
      { sku: { contains: searchTerm, mode: 'insensitive' } },
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Status filter
  if (filters.status === 'active') {
    where.isActive = true;
  } else if (filters.status === 'inactive') {
    where.isActive = false;
  }

  // Stock level filter
  if (filters.stock === 'in-stock') {
    where.stockQuantity = { gt: 10 };
  } else if (filters.stock === 'low-stock') {
    where.stockQuantity = { gt: 0, lte: 10 };
  } else if (filters.stock === 'out-of-stock') {
    where.stockQuantity = 0;
  }

  // Category filter
  if (filters.category) {
    const categoryId = parseInt(filters.category);
    if (!isNaN(categoryId)) {
      where.categoryId = categoryId;
    }
  }

  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      (where.price as Record<string, number>).gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      (where.price as Record<string, number>).lte = filters.maxPrice;
    }
  }

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        categories: { select: { id: true, name: true } },
        brands: { select: { id: true, name: true } },
        _count: { select: { product_views: true, quote_lines: true } },
      },
    }),
    prisma.products.count({ where }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id.toString(),
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      imageUrl: product.imageUrl,
      images: product.images,
      price: parseFloat(product.price.toString()),
      stock: product.stockQuantity,
      unit: product.unit,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      category: product.categories?.name || null,
      categoryId: product.categories?.id || null,
      brand: product.brands?.name || null,
      brandId: product.brands?.id || null,
      views: product._count.product_views,
      quotes: product._count.quote_lines,
      createdAt: product.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Search products - dedicated search function for API use
 * Returns products matching the search term in SKU, name, or description
 */
export async function searchProducts(
  searchTerm: string,
  options: {
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
  } = {}
) {
  const { minPrice, maxPrice, page = 1, pageSize = 20 } = options;
  
  return getProducts(
    {
      search: searchTerm,
      minPrice,
      maxPrice,
      status: 'all',
      stock: 'all',
    },
    page,
    pageSize
  );
}

/**
 * Update product stock
 */
export async function updateProductStock(productId: number, quantity: number) {
  const product = await prisma.products.update({
    where: { id: productId },
    data: { stockQuantity: quantity , updatedAt: new Date()},
  });
  invalidateDashboardCache(CACHE_KEYS.PRODUCTS_LIST);
  return product;
}

/**
 * Toggle product active status
 */
export async function toggleProductStatus(productId: number) {
  const product = await prisma.products.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Product not found');

  const updated = await prisma.products.update({
    where: { id: productId },
    data: { isActive: !product.isActive , updatedAt: new Date()},
  });
  invalidateDashboardCache(CACHE_KEYS.PRODUCTS_LIST);
  return updated;
}

/**
 * Export products to CSV
 */
export async function exportProductsToCSV(filters: ProductFilters = {}): Promise<string> {
  const { products } = await getProducts(filters, 1, 10000);
  
  const headers = ['ID', 'Name', 'SKU', 'Price', 'Stock', 'Category', 'Status', 'Views', 'Quotes', 'Created At'];
  const rows = products.map((p) => [
    p.id,
    p.name,
    p.sku,
    p.price.toString(),
    p.stock.toString(),
    p.category || '',
    p.isActive ? 'Active' : 'Inactive',
    p.views.toString(),
    p.quotes.toString(),
    new Date(p.createdAt).toISOString(),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Generate slug from product name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validate required fields for product creation
 */
export async function validateProductInput(input: Partial<ProductCreateInput>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.sku || typeof input.sku !== 'string' || !input.sku.trim()) {
    errors.push('SKU is required');
  }
  if (!input.name || typeof input.name !== 'string' || !input.name.trim()) {
    errors.push('Name is required');
  }
  if (input.price === undefined || input.price === null || typeof input.price !== 'number' || input.price < 0) {
    errors.push('Price is required and must be a non-negative number');
  }
  if (!input.categoryId || typeof input.categoryId !== 'number') {
    errors.push('Category ID is required');
  }
  if (!input.brandId || typeof input.brandId !== 'number') {
    errors.push('Brand ID is required');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Create a new product
 */
export async function createProduct(input: ProductCreateInput): Promise<{ success: boolean; product?: unknown; error?: string }> {
  // Validate required fields
  const validation = validateProductInput(input);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(', ') };
  }

  // Check for duplicate SKU
  const existingProduct = await prisma.products.findUnique({
    where: { sku: input.sku },
  });
  if (existingProduct) {
    return { success: false, error: 'SKU already exists' };
  }

  // Verify category exists
  const category = await prisma.categories.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    return { success: false, error: 'Category not found' };
  }

  // Verify brand exists
  const brand = await prisma.brands.findUnique({ where: { id: input.brandId } });
  if (!brand) {
    return { success: false, error: 'Brand not found' };
  }

  // Generate slug if not provided
  const slug = input.slug || generateSlug(input.name);

  // Check for duplicate slug
  const existingSlug = await prisma.products.findUnique({ where: { slug } });
  if (existingSlug) {
    // Append timestamp to make unique
    const uniqueSlug = `${slug}-${Date.now()}`;
    input.slug = uniqueSlug;
  } else {
    input.slug = slug;
  }

  try {
    const product = await prisma.products.create({
      data: {
        sku: input.sku.trim(),
        name: input.name.trim(),
        slug: input.slug,
        description: input.description || null,
        detailedDescription: input.detailedDescription || null,
        price: input.price,
        stockQuantity: input.stockQuantity ?? 0,
        unit: input.unit || 'Unit',
        brandId: input.brandId,
        categoryId: input.categoryId,
        imageUrl: input.imageUrl || null,
        images: input.images || [],
        tags: input.tags || [],
        specifications: input.specifications ? JSON.parse(JSON.stringify(input.specifications)) : null,
        isActive: input.isActive ?? true,
        isFeatured: input.isFeatured ?? false,
        updatedAt: new Date(),
      },
      include: {
        categories: { select: { id: true, name: true } },
        brands: { select: { id: true, name: true } },
      },
    });

    // Invalidate cache and revalidate paths
    invalidateDashboardCache(CACHE_KEYS.PRODUCTS_LIST);
    revalidatePath('/products');
    revalidatePath('/admin/products');

    return { success: true, product };
  } catch (error) {
    console.error('[CREATE_PRODUCT]', error);
    return { success: false, error: 'Failed to create product' };
  }
}

/**
 * Get a single product by ID with relations
 */
export async function getProductById(id: number): Promise<{ success: boolean; product?: unknown; error?: string }> {
  try {
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        categories: { select: { id: true, name: true } },
        brands: { select: { id: true, name: true } },
        _count: { select: { product_views: true, quote_lines: true } },
      },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        detailedDescription: product.detailedDescription,
        imageUrl: product.imageUrl,
        images: product.images,
        price: parseFloat(product.price.toString()),
        stockQuantity: product.stockQuantity,
        unit: product.unit,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        category: product.categories,
        brand: product.brands,
        tags: product.tags,
        specifications: product.specifications,
        views: product._count.product_views,
        quotes: product._count.quote_lines,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    };
  } catch (error) {
    console.error('[GET_PRODUCT_BY_ID]', error);
    return { success: false, error: 'Failed to fetch product' };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(input: ProductUpdateInput): Promise<{ success: boolean; product?: unknown; error?: string }> {
  const { id, ...updateData } = input;

  // Check if product exists
  const existingProduct = await prisma.products.findUnique({ where: { id } });
  if (!existingProduct) {
    return { success: false, error: 'Product not found' };
  }

  // If SKU is being updated, check for duplicates
  if (updateData.sku && updateData.sku !== existingProduct.sku) {
    const duplicateSku = await prisma.products.findUnique({ where: { sku: updateData.sku } });
    if (duplicateSku) {
      return { success: false, error: 'SKU already exists' };
    }
  }

  // If category is being updated, verify it exists
  if (updateData.categoryId) {
    const category = await prisma.categories.findUnique({ where: { id: updateData.categoryId } });
    if (!category) {
      return { success: false, error: 'Category not found' };
    }
  }

  // If brand is being updated, verify it exists
  if (updateData.brandId) {
    const brand = await prisma.brands.findUnique({ where: { id: updateData.brandId } });
    if (!brand) {
      return { success: false, error: 'Brand not found' };
    }
  }

  // If name is being updated and no slug provided, regenerate slug
  if (updateData.name && !updateData.slug) {
    const newSlug = generateSlug(updateData.name);
    if (newSlug !== existingProduct.slug) {
      const existingSlug = await prisma.products.findUnique({ where: { slug: newSlug } });
      if (existingSlug && existingSlug.id !== id) {
        updateData.slug = `${newSlug}-${Date.now()}`;
      } else {
        updateData.slug = newSlug;
      }
    }
  }

  try {
    const product = await prisma.products.update({
      where: { id },
      data: {
        ...(updateData.sku && { sku: updateData.sku.trim() , updatedAt: new Date()}),
        ...(updateData.name && { name: updateData.name.trim() }),
        ...(updateData.slug && { slug: updateData.slug }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.detailedDescription !== undefined && { detailedDescription: updateData.detailedDescription }),
        ...(updateData.price !== undefined && { price: updateData.price }),
        ...(updateData.stockQuantity !== undefined && { stockQuantity: updateData.stockQuantity }),
        ...(updateData.unit !== undefined && { unit: updateData.unit }),
        ...(updateData.brandId && { brandId: updateData.brandId }),
        ...(updateData.categoryId && { categoryId: updateData.categoryId }),
        ...(updateData.imageUrl !== undefined && { imageUrl: updateData.imageUrl }),
        ...(updateData.images !== undefined && { images: updateData.images }),
        ...(updateData.tags !== undefined && { tags: updateData.tags }),
        ...(updateData.specifications !== undefined && { specifications: updateData.specifications ? JSON.parse(JSON.stringify(updateData.specifications)) : null }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
        ...(updateData.isFeatured !== undefined && { isFeatured: updateData.isFeatured }),
        updatedAt: new Date(),
      },
      include: {
        categories: { select: { id: true, name: true } },
        brands: { select: { id: true, name: true } },
      },
    });

    // Invalidate cache and revalidate paths
    invalidateDashboardCache(CACHE_KEYS.PRODUCTS_LIST);
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);
    revalidatePath('/admin/products');

    return { success: true, product };
  } catch (error) {
    console.error('[UPDATE_PRODUCT]', error);
    return { success: false, error: 'Failed to update product' };
  }
}

/**
 * Delete a product (soft or hard delete)
 */
export async function deleteProduct(id: number, hardDelete = false): Promise<{ success: boolean; error?: string }> {
  // Check if product exists
  const existingProduct = await prisma.products.findUnique({ 
    where: { id },
    include: {
      _count: { select: { quote_lines: true, cart_items: true } },
    },
  });
  
  if (!existingProduct) {
    return { success: false, error: 'Product not found' };
  }

  try {
    if (hardDelete) {
      // Check for foreign key references
      if (existingProduct._count.quote_lines > 0) {
        return { success: false, error: 'Cannot delete product with existing quote references. Use soft delete instead.' };
      }
      if (existingProduct._count.cart_items > 0) {
        // Remove cart items first
        await prisma.cart_items.deleteMany({ where: { productId: id } });
      }
      
      // Delete related records first
      await prisma.product_views.deleteMany({ where: { productId: id } });
      await prisma.stock_movements.deleteMany({ where: { productId: id } });
      
      // Hard delete the product
      await prisma.products.delete({ where: { id } });
    } else {
      // Soft delete - just set isActive to false
      await prisma.products.update({
        where: { id },
        data: { isActive: false , updatedAt: new Date()},
      });
    }

    // Invalidate cache and revalidate paths
    invalidateDashboardCache(CACHE_KEYS.PRODUCTS_LIST);
    revalidatePath('/products');
    revalidatePath(`/products/${existingProduct.slug}`);
    revalidatePath('/admin/products');

    return { success: true };
  } catch (error) {
    console.error('[DELETE_PRODUCT]', error);
    return { success: false, error: 'Failed to delete product' };
  }
}
