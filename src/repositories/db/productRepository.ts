import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const productRepo = {
  async getAll(options: { brandSlug?: string; categorySlug?: string } = {}) {
    // generated Prisma types have pluralized model type names; use any here to avoid type drift
    const where: any = {};
    if (options.brandSlug) {
      where.brand = { slug: options.brandSlug };
    }
    if (options.categorySlug) {
      where.categories = { some: { category: { slug: options.categorySlug } } };
    }

    return await prisma.products.findMany({
      where,
      // include shapes can vary in generated client; cast include to any
      include: ({
        brand: true,
        images: true,
        categories: { include: { category: true } },
      } as any),
    }) as any;
  },

  async getBySlug(slug: string) {
    return await prisma.products.findUnique({
      where: { slug },
      include: ({
        brand: true,
        images: true,
        categories: { include: { category: true } },
      } as any),
    }) as any;
  },
};
