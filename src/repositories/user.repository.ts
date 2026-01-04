/**
 * User Repository
 * 
 * Data access layer for User entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { User } from '@/lib/types/domain';

interface CreateUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  hashedPassword?: string;
  role?: string;
}

interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  lastLogin?: Date;
}

export class UserRepository extends BaseRepository<User, CreateUserInput, UpdateUserInput> {
  async findAll(limit?: number, skip?: number): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id: Number(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      this.handleError(error, 'findByEmail');
    }
  }

  async findByPhone(phone: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { phone },
      });
    } catch (error) {
      this.handleError(error, 'findByPhone');
    }
  }

  async create(data: CreateUserInput): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
          phone: data.phone,
          hashedPassword: data.hashedPassword,
          role: data.role || 'customer',
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateUserInput): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id: Number(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    try {
      return await prisma.user.count({ where });
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

      return await prisma.user.count({
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
      return await prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      this.handleError(error, 'updateLastLogin');
    }
  }
}

export const userRepository = new UserRepository();
