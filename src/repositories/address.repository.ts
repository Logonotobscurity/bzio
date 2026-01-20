/**
 * Address Repository
 * 
 * Data access layer for Address entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Address } from '@/lib/types/domain';

interface CreateAddressInput {
  userId: number;
  type: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
  label?: string;
  contactPerson?: string;
  phone?: string;
}

interface UpdateAddressInput {
  type?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
  label?: string;
  contactPerson?: string;
  phone?: string;
}

export class AddressRepository extends BaseRepository<Address, CreateAddressInput, UpdateAddressInput> {
  async findAll(limit?: number, skip?: number): Promise<Address[]> {
    try {
      return (await prisma.addresses.findMany({
        take: limit,
        skip,
        orderBy: { id: 'desc' },
      })) as unknown as Address[];
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number): Promise<Address | null> {
    try {
      return (await prisma.addresses.findUnique({ where: { id: Number(id) } })) as unknown as Address | null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByUserId(userId: number): Promise<Address[]> {
    try {
      return (await prisma.addresses.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } })) as unknown as Address[];
    } catch (error) {
      this.handleError(error, 'findByUserId');
    }
  }

  async findDefaultForUser(userId: number): Promise<Address | null> {
    try {
      return (await prisma.addresses.findFirst({ where: { userId, isDefault: true } })) as unknown as Address | null;
    } catch (error) {
      this.handleError(error, 'findDefaultForUser');
    }
  }

  async create(data: CreateAddressInput): Promise<Address> {
    try {
      // If setting as default, unset other defaults for this user
      if (data.isDefault) {
        await prisma.addresses.updateMany({
          where: { userId: data.userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return (await prisma.addresses.create({ data: data as any })) as unknown as Address;
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateAddressInput): Promise<Address> {
    try {
      // If setting as default, unset other defaults for this user
      if (data.isDefault) {
        const address = await prisma.addresses.findUnique({
          where: { id: Number(id) },
        });

        if (address) {
          await prisma.addresses.updateMany({
            where: { userId: address.userId, isDefault: true, id: { not: Number(id) } },
            data: { isDefault: false },
          });
        }
      }

      return (await prisma.addresses.update({ where: { id: Number(id) }, data: data as any })) as unknown as Address;
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number): Promise<boolean> {
    try {
      await prisma.addresses.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    try {
      return await prisma.addresses.count({ where });
    } catch (error) {
      this.handleError(error, 'count');
    }
  }
}

export const addressRepository = new AddressRepository();
