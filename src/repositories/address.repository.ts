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
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface UpdateAddressInput {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export class AddressRepository extends BaseRepository<Address, CreateAddressInput, UpdateAddressInput> {
  async findAll(limit?: number, skip?: number): Promise<Address[]> {
    try {
      return await prisma.address.findMany({
        take: limit,
        skip,
        orderBy: { id: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number): Promise<Address | null> {
    try {
      return await prisma.address.findUnique({
        where: { id: Number(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByUserId(userId: number): Promise<Address[]> {
    try {
      return await prisma.address.findMany({
        where: { userId },
        orderBy: { isDefault: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findByUserId');
    }
  }

  async findDefaultForUser(userId: number): Promise<Address | null> {
    try {
      return await prisma.address.findFirst({
        where: { userId, isDefault: true },
      });
    } catch (error) {
      this.handleError(error, 'findDefaultForUser');
    }
  }

  async create(data: CreateAddressInput): Promise<Address> {
    try {
      // If setting as default, unset other defaults for this user
      if (data.isDefault) {
        await prisma.address.updateMany({
          where: { userId: data.userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await prisma.address.create({
        data: {
          userId: data.userId,
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          isDefault: data.isDefault || false,
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateAddressInput): Promise<Address> {
    try {
      // If setting as default, unset other defaults for this user
      if (data.isDefault) {
        const address = await prisma.address.findUnique({
          where: { id: Number(id) },
        });

        if (address) {
          await prisma.address.updateMany({
            where: { userId: address.userId, isDefault: true, id: { not: Number(id) } },
            data: { isDefault: false },
          });
        }
      }

      return await prisma.address.update({
        where: { id: Number(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number): Promise<boolean> {
    try {
      await prisma.address.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    try {
      return await prisma.address.count({ where });
    } catch (error) {
      this.handleError(error, 'count');
    }
  }
}

export const addressRepository = new AddressRepository();
