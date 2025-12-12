
import { getAllProducts } from './productService';

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  imageUrl: string;
  excerpt: string;
}

/**
 * Search products by query string
 * Searches in name, brand, category, and description
 */
export async function searchProducts(query: string, minChars: number = 3): Promise<SearchResult[]> {
  if (query.length < minChars) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  const products = await getAllProducts();

  return products
    .filter((product) => {
      const searchableText = `
          ${product.name}
          ${product.brand}
          ${product.category}
          ${product.description || ''}
        `.toLowerCase();

      return searchableText.includes(lowerQuery);
    })
    .map((product) => ({
      id: String(product.id),
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      category: product.category,
      price: product.price ?? 0, // Fix: Default price to 0 if undefined
      imageUrl: product.imageUrl,
      excerpt: (product.description ?? '').substring(0, 100), // Fix: Handle undefined description
    }))
    .slice(0, 10); // Return top 10 results
}

/**
 * Get suggestions based on partial query
 */
export async function getSuggestions(query: string, limit: number = 5): Promise<string[]> {
  if (query.length < 2) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  const uniqueSuggestions = new Set<string>();
  const products = await getAllProducts();

  // Add product names
  products.forEach((product) => {
    if (
      product.name.toLowerCase().includes(lowerQuery) &&
      uniqueSuggestions.size < limit
    ) {
      uniqueSuggestions.add(product.name);
    }
  });

  // Add brands
  if (uniqueSuggestions.size < limit) {
    products.forEach((product) => {
      if (
        product.brand.toLowerCase().includes(lowerQuery) &&
        !uniqueSuggestions.has(product.brand) &&
        uniqueSuggestions.size < limit
      ) {
        uniqueSuggestions.add(product.brand);
      }
    });
  }

  // Add categories
  if (uniqueSuggestions.size < limit) {
    products.forEach((product) => {
      if (
        product.category.toLowerCase().includes(lowerQuery) &&
        !uniqueSuggestions.has(product.category) &&
        uniqueSuggestions.size < limit
      ) {
        uniqueSuggestions.add(product.category);
      }
    });
  }

  return Array.from(uniqueSuggestions);
}
