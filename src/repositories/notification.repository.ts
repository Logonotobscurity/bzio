/**
 * Notification Repository
 * 
 * Data access layer for Notification entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Notification } from '@/lib/types/domain';

interface CreateNotificationInput {
  userId: number;
  title: string;
  message: string;
  read?: boolean;
}

interface UpdateNotificationInput {
  title?: string;
  message?: string;
  read?: boolean;
}

export class NotificationRepository extends BaseRepository<Notification, CreateNotificationInput, UpdateNotificationInput> {
  async findAll(limit?: number, skip?: number): Promise<Notification[]> {
    try {
      return await prisma.notification.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number): Promise<Notification | null> {
    try {
      return await prisma.notification.findUnique({
        where: { id: Number(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByUserId(userId: number, limit?: number, skip?: number): Promise<Notification[]> {
    try {
      return await prisma.notification.findMany({
        where: { userId },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findByUserId');
    }
  }

  async findUnreadByUserId(userId: number, limit?: number): Promise<Notification[]> {
    try {
      return await prisma.notification.findMany({
        where: { userId, read: false },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findUnreadByUserId');
    }
  }

  async create(data: CreateNotificationInput): Promise<Notification> {
    try {
      return await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          read: data.read || false,
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateNotificationInput): Promise<Notification> {
    try {
      return await prisma.notification.update({
        where: { id: Number(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number): Promise<boolean> {
    try {
      await prisma.notification.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    try {
      return await prisma.notification.count({ where });
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Count unread notifications for a user
   */
  async countUnreadForUser(userId: number): Promise<number> {
    try {
      return await prisma.notification.count({
        where: { userId, read: false },
      });
    } catch (error) {
      this.handleError(error, 'countUnreadForUser');
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsReadForUser(userId: number): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return result.count;
    } catch (error) {
      this.handleError(error, 'markAllAsReadForUser');
    }
  }

  /**
   * Delete old notifications (older than N days)
   */
  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      const date = new Date();
      date.setDate(date.getDate() - daysOld);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: date,
          },
        },
      });
      return result.count;
    } catch (error) {
      this.handleError(error, 'deleteOldNotifications');
    }
  }
}

export const notificationRepository = new NotificationRepository();
