/**
 * Admin Notification Repository
 * 
 * Data access layer for Admin Notification entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma, AdminNotificationType } from '@prisma/client';

type AdminNotification = Prisma.admin_notificationsGetPayload<{}>;

interface CreateAdminNotificationInput {
  adminId: number;
  title: string;
  message: string;
  type: AdminNotificationType;
  data?: Prisma.InputJsonValue;
}

interface UpdateAdminNotificationInput {
  isRead?: boolean;
  title?: string;
  message?: string;
  data?: Prisma.InputJsonValue;
}

export class AdminNotificationRepository extends BaseRepository<AdminNotification, CreateAdminNotificationInput, UpdateAdminNotificationInput> {
  async findAll(limit?: number, skip?: number) {
    try {
      return await prisma.admin_notifications.findMany({
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
      return await prisma.admin_notifications.count();
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  async findById(id: string | number) {
    try {
      return await prisma.admin_notifications.findUnique({
        where: { id: Number(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByAdminId(adminId: number, limit?: number, skip?: number) {
    try {
      return await prisma.admin_notifications.findMany({
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
      return await prisma.admin_notifications.create({
        data: {
          adminId: data.adminId,
          title: data.title,
          message: data.message,
          type: data.type,
          data: data.data || {},
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateAdminNotificationInput) {
    try {
      return await prisma.admin_notifications.update({
        where: { id: Number(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number) {
    try {
      await prisma.admin_notifications.delete({
        where: { id: Number(id) },
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
      return await prisma.admin_notifications.count({
        where: {
          adminId,
          isRead: false,
        },
      });
    } catch (error) {
      this.handleError(error, 'countUnread');
    }
  }

  /**
   * Mark as read
   */
  async markAsRead(id: string | number) {
    try {
      return await prisma.admin_notifications.update({
        where: { id: Number(id) },
        data: {
          isRead: true,
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
      return await prisma.admin_notifications.updateMany({
        where: {
          adminId,
          isRead: false,
        },
        data: {
          isRead: true,
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
      return await prisma.admin_notifications.deleteMany({
        where: { adminId },
      });
    } catch (error) {
      this.handleError(error, 'deleteAll');
    }
  }
}

export const adminNotificationRepository = new AdminNotificationRepository();
