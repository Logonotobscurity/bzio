import prisma from '@/lib/prisma';
import type { Address } from '@prisma/client';

type CreateAddressInput = Omit<Address, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateAddressInput = Partial<Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export const createAddress = async (userId: number, data: Omit<CreateAddressInput, 'userId'>): Promise<Address> => {
  return prisma.address.create({
    data: { ...data, userId },
  });
};

export const getAddressesByUser = async (userId: number): Promise<Address[]> => {
  return prisma.address.findMany({
    where: { userId },
  });
};

export const updateAddress = async (id: number, data: UpdateAddressInput): Promise<Address> => {
  return prisma.address.update({
    where: { id },
    data,
  });
};

export const deleteAddress = async (id: number): Promise<Address> => {
  return prisma.address.delete({
    where: { id },
  });
};
