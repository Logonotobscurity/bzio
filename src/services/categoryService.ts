import { Category } from '@/lib/schema';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) {
      throw new Error('Failed to fetch categories');
    }
    return res.json();
  },
};
