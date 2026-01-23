import { prisma } from '@/lib/db';

export const companyRepo = {
  async getAll() {
    return await prisma.businessAccount.findMany();
  },

  async getBySlug(slug: string) {
    return await prisma.businessAccount.findUnique({ where: { slug } });
  },

  async findById(id: number) {
    return await prisma.businessAccount.findUnique({ where: { id } });
  }
};
