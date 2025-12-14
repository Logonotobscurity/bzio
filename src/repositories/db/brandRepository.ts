import prisma from '@/lib/prisma';

export const brandRepo = {
  async getAll() {
    return await prisma.brand.findMany();
  },

  async getBySlug(slug: string) {
    return await prisma.brand.findUnique({ where: { slug } });
  },
};
