import { prisma } from '@/lib/db';
import type { Brand } from '@prisma/client';

type CreateBrandInput = Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>;

export const getAllBrands = async (): Promise<Brand[]> => {
  return prisma.brand.findMany({
    orderBy: { name: 'asc' },
  });
};

export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
  return prisma.brand.findUnique({
    where: { slug },
    include: { products: true },
  });
};

export const getFeaturedBrands = async (limit: number = 10): Promise<Brand[]> => {
  return prisma.brand.findMany({
    where: { isFeatured: true },
    take: limit,
  });
};

export const createBrand = async (data: CreateBrandInput): Promise<Brand> => {
  return prisma.brand.create({ data: data as any });
};
