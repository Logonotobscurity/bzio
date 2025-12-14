import prisma from '@/lib/prisma';

export const companyRepo = {
  async getAll() {
    return await prisma.company.findMany();
  },

  async getBySlug(slug: string) {
    return await prisma.company.findUnique({ where: { slug } });
  },
};
