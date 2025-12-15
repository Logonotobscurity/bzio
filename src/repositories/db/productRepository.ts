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

    return await prisma.product.findMany({
      where,
      include: {
        brand: true,
        images: true,
        categories: { include: { category: true } },
      },
    }) as Awaited<ReturnType<typeof prisma.product.findMany>>;
  },

  async getBySlug(slug: string) {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        images: true,
        categories: { include: { category: true } },
      },
    });
  },
};
