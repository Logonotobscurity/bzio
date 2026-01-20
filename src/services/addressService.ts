import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

type Address = Prisma.addressesGetPayload<{}>;
type CreateAddressInput = Omit<Address, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateAddressInput = Partial<Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export const createAddress = async (userId: number, data: Omit<CreateAddressInput, 'userId'>): Promise<Address> => {
  return (await prisma.addresses.create({ data: { ...data, userId } as any })) as unknown as Address;
};

export const getAddressesByUser = async (userId: number): Promise<Address[]> => {
  return (await prisma.addresses.findMany({ where: { userId } })) as unknown as Address[];
};

export const updateAddress = async (id: number, data: UpdateAddressInput): Promise<Address> => {
  return (await prisma.addresses.update({ where: { id }, data: data as any })) as unknown as Address;
};

export const deleteAddress = async (id: number): Promise<Address> => {
  return (await prisma.addresses.delete({ where: { id } })) as unknown as Address;
};
