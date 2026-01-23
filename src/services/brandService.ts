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
  const all = await prisma.brands.findMany({
    where: { isFeatured: true },
    take: limit,
    orderBy: { name: 'asc' },
  });
  return all;
};

export const createBrand = async (data: CreateBrandInput): Promise<Brand> => {
  return prisma.brands.create({ data: { ...data, updatedAt: new Date() } });
};
