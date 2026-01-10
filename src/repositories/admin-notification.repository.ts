/**
 * Admin Notification Repository
 * 
 * Data access layer for Admin Notification entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';

type AdminNotification = Prisma.AdminNotificationGetPayload<{}>;

interface CreateAdminNotificationInput {
  adminId: number;
  title: string;
  message: string;
  type: string;
  actionUrl?: string;
  data?: Prisma.InputJsonValue;
}

interface UpdateAdminNotificationInput {
  read?: boolean;
  title?: string;
  message?: string;
  data?: Prisma.InputJsonValue;
}

export class AdminNotificationRepository extends BaseRepository<AdminNotification, CreateAdminNotificationInput, UpdateAdminNotificationInput> {
  async findAll(limit?: number, skip?: number) {
    try {
      return await prisma.adminNotification.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async count() {
    try {
      return await prisma.adminNotification.count();
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  async findById(id: string | number) {
    try {
      return await prisma.adminNotification.findUnique({
        where: { id: String(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByAdminId(adminId: number, limit?: number, skip?: number) {
    try {
      return await prisma.adminNotification.findMany({
        where: { adminId },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findByAdminId');
    }
  }

  async create(data: CreateAdminNotificationInput) {
    try {
      return await prisma.adminNotification.create({
        data: {
          adminId: data.adminId,
          title: data.title,
          message: data.message,
          type: data.type,
          actionUrl: data.actionUrl,
          data: data.data || {},
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateAdminNotificationInput) {
    try {
      return await prisma.adminNotification.update({
        where: { id: String(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number) {
    try {
      await prisma.adminNotification.delete({
        where: { id: String(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  /**
   * Count unread notifications for admin
   */
  async countUnread(adminId: number) {
    try {
      return await prisma.adminNotification.count({
        where: {
          adminId,
          read: false,
        },
      });
    } catch (error) {
      this.handleError(error, 'countUnread');
    }
  }

  /**
   * Mark as read
   */
  async markAsRead(id: string) {
    try {
      return await prisma.adminNotification.update({
        where: { id },
        data: {
          read: true,
        },
      });
    } catch (error) {
      this.handleError(error, 'markAsRead');
    }
  }

  /**
   * Mark all as read for admin
   */
  async markAllAsRead(adminId: number) {
    try {
      return await prisma.adminNotification.updateMany({
        where: {
          adminId,
          read: false,
        },
        data: {
          read: true,
        },
      });
    } catch (error) {
      this.handleError(error, 'markAllAsRead');
    }
  }

  /**
   * Delete all for admin
   */
  async deleteAll(adminId: number) {
    try {
      return await prisma.adminNotification.deleteMany({
        where: { adminId },
      });
    } catch (error) {
      this.handleError(error, 'deleteAll');
    }
  }
}

export const adminNotificationRepository = new AdminNotificationRepository();
