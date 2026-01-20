import { prisma } from '@/lib/db';

export const brandRepo = {
  async getAll() {
    return await prisma.brands.findMany();
  },

  async getBySlug(slug: string) {
    return await prisma.brands.findUnique({ where: { slug } });
  },
};
