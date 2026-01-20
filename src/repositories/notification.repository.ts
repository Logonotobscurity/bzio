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
  type: string;
  message: string;
  isRead?: boolean;
  link?: string;
}

interface UpdateNotificationInput {
  type?: string;
  message?: string;
  isRead?: boolean;
  link?: string;
}

export class NotificationRepository extends BaseRepository<Notification, CreateNotificationInput, UpdateNotificationInput> {
  async findAll(limit?: number, skip?: number): Promise<Notification[]> {
    try {
      return (await prisma.notifications.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      })) as unknown as Notification[];
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number): Promise<Notification | null> {
    try {
      return (await prisma.notifications.findUnique({
        where: { id: Number(id) },
      })) as unknown as Notification | null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByUserId(userId: number, limit?: number, skip?: number): Promise<Notification[]> {
    try {
      return (await prisma.notifications.findMany({
        where: { userId },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      })) as unknown as Notification[];
    } catch (error) {
      this.handleError(error, 'findByUserId');
    }
  }

  async findUnreadByUserId(userId: number, limit?: number): Promise<Notification[]> {
    try {
      return (await prisma.notifications.findMany({
        where: { userId, isRead: false },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })) as unknown as Notification[];
    } catch (error) {
      this.handleError(error, 'findUnreadByUserId');
    }
  }

  async create(data: CreateNotificationInput): Promise<Notification> {
    try {
      return (await prisma.notifications.create({
        data: {
          userId: data.userId,
          // ensure Prisma enum compatibility and set updatedAt
          type: (data.type || 'INFO').toString().toUpperCase() as any,
          message: data.message,
          isRead: data.isRead || false,
          ...(data.link ? { link: data.link } : {}),
          updatedAt: new Date(),
        },
      })) as unknown as Notification;
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateNotificationInput): Promise<Notification> {
    try {
      const updateData: any = { ...data };
      if (data.type) updateData.type = (data.type as string).toUpperCase() as any;
      return (await prisma.notifications.update({ where: { id: Number(id) }, data: updateData })) as unknown as Notification;
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number): Promise<boolean> {
    try {
      await prisma.notifications.delete({ where: { id: Number(id) } });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    try {
      return await prisma.notifications.count({ where });
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Count unread notifications for a user
   */
  async countUnreadForUser(userId: number): Promise<number> {
    try {
      return await prisma.notifications.count({
        where: { userId, isRead: false },
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
      const result = await prisma.notifications.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
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

      const result = await prisma.notifications.deleteMany({
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
