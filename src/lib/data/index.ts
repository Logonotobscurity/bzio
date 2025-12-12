import { type Product, type Brand, type Category, type Company } from '@/lib/schema';
import productsData from './all-products.json';

// --- Extended Interface for PDP ---
export interface PDPContext {
  product: Product;
  brand: Brand;
  company?: Company;
  category: Category;
  relatedProducts: Product[];
}

export const products = productsData;