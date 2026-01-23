/**
 * User Repository
 * 
 * Data access layer for User entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { users as UserRow, UserRole } from '@prisma/client';
import type { User } from '@/lib/types/domain';
import { mapUserRow, mapArrayIds } from './db/adapter';

interface CreateUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  password?: string;
  role?: UserRole | string;
}

interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  role?: UserRole | string;
  isActive?: boolean;
  lastLogin?: Date;
}

export class UserRepository extends BaseRepository<User, CreateUserInput, UpdateUserInput> {
  async findAll(limit?: number, skip?: number): Promise<User[]> {
    try {
      const rows = await prisma.users.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      });
      return (mapArrayIds(rows) as unknown) as User[];
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number): Promise<User | null> {
    try {
      const row = await prisma.users.findUnique({
        where: { id: Number(id) },
      });
      return row ? (mapUserRow(row) as User) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const row = await prisma.users.findUnique({
        where: { email },
      });
      return row ? (mapUserRow(row) as User) : null;
    } catch (error) {
      this.handleError(error, 'findByEmail');
    }
  }

  async findByPhone(phone: string): Promise<User | null> {
    try {
      const row = await prisma.users.findFirst({
        where: { phone },
      });
      return row ? (mapUserRow(row) as User) : null;
    } catch (error) {
      this.handleError(error, 'findByPhone');
    }
  }

  async create(data: CreateUserInput): Promise<User> {
    try {
      const row = await prisma.users.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
          phone: data.phone,
          password: data.password || '',
          role: (data.role as UserRole) || 'CUSTOMER',
        },
      });
      return mapUserRow(row) as User;
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateUserInput): Promise<User> {
    try {
      const row = await prisma.users.update({
        where: { id: Number(id) },
        data: {
          ...data,
          role: (data.role as UserRole) || undefined,
        },
      });
      return mapUserRow(row) as User;
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number): Promise<boolean> {
    try {
      await prisma.users.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    try {
      return await prisma.users.count({ where });
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Count users created in the last N days
   */
  async countRecentUsers(days: number = 7): Promise<number> {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);

      return await prisma.users.count({
        where: {
          createdAt: {
            gte: date,
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'countRecentUsers');
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: number): Promise<User> {
    try {
      const row = await prisma.users.update({
        where: { id: userId },
        data: { lastLogin: new Date() },
      });
      return mapUserRow(row) as User;
    } catch (error) {
      this.handleError(error, 'updateLastLogin');
    }
  }
}

export const userRepository = new UserRepository();
