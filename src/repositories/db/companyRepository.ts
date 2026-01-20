import { prisma } from '@/lib/db';

export const companyRepo = {
  async getAll() {
    return await prisma.companies.findMany();
  },

  async getBySlug(slug: string) {
    // Use findFirst to avoid requiring a unique scalar in generated types
    return await prisma.companies.findFirst({ where: { slug } });
  },
};
