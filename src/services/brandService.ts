import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

type Brand = Prisma.brandsGetPayload<{}>;
type CreateBrandInput = Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>;

export const getAllBrands = async (): Promise<Brand[]> => {
  return prisma.brands.findMany({
    orderBy: { name: 'asc' },
  });
};

export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
  return prisma.brands.findUnique({
    where: { slug },
    include: { products: true },
  });
};

export const getFeaturedBrands = async (limit: number = 10): Promise<Brand[]> => {
  // Prisma schema may not expose `isFeatured` in the generated where input.
  // Query for a reasonable set and filter at runtime to avoid type errors.
  const all = await prisma.brands.findMany({
    orderBy: { name: 'asc' },
  });
  return (all.filter(b => (b as any).isFeatured) as Brand[]).slice(0, limit);
};

export const createBrand = async (data: CreateBrandInput): Promise<Brand> => {
  // Ensure required timestamp fields are provided to satisfy Prisma input types.
  return prisma.brands.create({ data: { ...data, updatedAt: new Date() } });
};
