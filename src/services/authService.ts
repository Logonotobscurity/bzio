import { prisma } from '@/lib/db';
import type { User } from '@prisma/client';
import bcryptjs from 'bcryptjs';

type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

export const createUser = async (email: string, password: string, firstName?: string, lastName?: string): Promise<User> => {
  const passwordHash = await bcryptjs.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
    },
  });
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const verifyPassword = async (passwordHash: string, password: string): Promise<boolean> => {
  return bcryptjs.compare(password, passwordHash);
};

export const updateUser = async (id: number, data: UpdateUserInput): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data,
  });
};
