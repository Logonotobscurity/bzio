import { prisma } from '@/lib/db';

export const companyRepo = {
  async getAll() {
    return await prisma.companies.findMany();
  },

  async getBySlug(slug: string) {
    return await prisma.companies.findUnique({ where: { slug } });
  },
};
