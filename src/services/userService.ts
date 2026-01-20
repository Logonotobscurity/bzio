import { prisma } from '@/lib/db';
import type { User } from '@prisma/client';

export const getUserById = async (id: number): Promise<User | null> => {
  return prisma.users.findUnique({
    where: { id },
    include: { addresses: true, quotes: true },
  });
};

export const getUserByPhone = async (phone: string): Promise<User | null> => {
  return prisma.users.findUnique({
    where: { phone },
  });
};

export const getAllUsers = async (limit: number = 50, skip: number = 0) => {
  return prisma.users.findMany({
    take: limit,
    skip,
    orderBy: { createdAt: 'desc' },
  });
};

export const deactivateUser = async (id: number): Promise<User> => {
  return prisma.users.update({
    where: { id },
    data: { isActive: false },
  });
};
