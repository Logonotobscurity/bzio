import products from './data/all-products.json';
import categories from './data/categories.json';

export async function getBestSellers() {
  // Return featured products sorted by some criteria
  return products
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => p.isFeatured && p.isActive && p.inStock)
    .slice(0, 8);
}

export async function getCategories() {
  return categories;
}
