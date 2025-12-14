import prisma from '@/lib/prisma';

export const categoryRepo = {
  async getAll() {
    return await prisma.category.findMany();
  },

  async getBySlug(slug: string) {
    return await prisma.category.findUnique({ where: { slug } });
  },
};
