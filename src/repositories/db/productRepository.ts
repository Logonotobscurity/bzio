import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const productRepo = {
  async getAll(options: { brandSlug?: string; categorySlug?: string } = {}) {
    const where: Prisma.ProductWhereInput = {};
    if (options.brandSlug) {
      where.brand = { slug: options.brandSlug };
    }
    if (options.categorySlug) {
      where.categories = { some: { category: { slug: options.categorySlug } } };
    }

    return await prisma.products.findMany({
      where,
      include: {
        brand: true,
        images: true,
        categories: { include: { category: true } },
      },
    }) as Awaited<ReturnType<typeof prisma.products.findMany>>;
  },

  async getBySlug(slug: string) {
    return await prisma.products.findUnique({
      where: { slug },
      include: {
        brand: true,
        images: true,
        categories: { include: { category: true } },
      },
    });
  },
};
