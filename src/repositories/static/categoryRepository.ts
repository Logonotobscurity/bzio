import categories from '@/lib/data/categories.json';
import { Category } from '@/lib/schema';

export const findBySlug = async (slug: string): Promise<Category | undefined> => {
  return categories.find((c) => c.slug === slug);
};

export const findById = async (id: string): Promise<Category | undefined> => {
    return categories.find((c) => c.id === id);
    };

export const all = async (): Promise<Category[]> => {
  return categories;
};
