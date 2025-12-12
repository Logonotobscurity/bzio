import brands from '@/lib/data/brands.json';
import { Brand } from '@/lib/schema';

export const findBySlug = async (slug: string): Promise<Brand | undefined> => {
  return brands.find((b) => b.slug === slug);
};

export const findById = async (id: string): Promise<Brand | undefined> => {
    return brands.find((b) => b.id === id);
  };

export const all = async (): Promise<Brand[]> => {
  return brands;
};
