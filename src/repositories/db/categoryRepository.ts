import { prisma } from '@/lib/db';

export const categoryRepo = {
  async getAll() {
    return await prisma.categories.findMany();
  },

  async getBySlug(slug: string) {
    return await prisma.categories.findUnique({ where: { slug } });
  },
};
