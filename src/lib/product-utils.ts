import { Product } from '@/lib/schema';

/**
 * Ensures product has imageUrl populated from images array
 * Used for backward compatibility and card display
 */
export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    imageUrl: product.imageUrl || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg')
  };
}

/**
 * Normalizes an array of products
 */
export function normalizeProducts(products: Product[] = []): Product[] {
  return products.map(normalizeProduct);
}
