/**
 * Admin Notification Service
 *
 * Business logic layer for admin notifications.
 * Handles notification creation, management, and delivery.
 */

import { adminNotificationRepository } from '@/repositories/admin-notification.repository';
import type { AdminNotification } from '@/lib/types/domain';
import type { Prisma, AdminNotificationType } from '@prisma/client';

interface CreateNotificationInput {
  adminId: number;
  type: AdminNotificationType | string;
  title: string;
  message: string;
  data?: Prisma.InputJsonValue;
}

interface UpdateNotificationInput {
  read?: boolean;
  data?: Prisma.InputJsonValue;
}

export class NotificationService {
  /**
   * Create a new notification for an admin
   */
  async createNotification(input: CreateNotificationInput): Promise<AdminNotification> {
    // Validate input
    this.validateNotificationInput(input);

    return (await adminNotificationRepository.create({
      adminId: input.adminId,
      type: input.type as AdminNotificationType,
      title: input.title,
      message: input.message,
      data: input.data,
    })) as unknown as AdminNotification;
  }

  /**
   * Create bulk notifications for multiple admins
   */
  async createBulkNotifications(
    adminIds: number[],
    input: Omit<CreateNotificationInput, 'adminId'>
  ): Promise<AdminNotification[]> {
    const notifications = await Promise.all(
      adminIds.map(adminId => this.createNotification({ ...input, adminId }))
    );
    return notifications;
  }

  /**
   * Get all notifications for an admin
   */
  async getAdminNotifications(
    adminId: number,
    limit?: number,
    skip?: number
  ): Promise<AdminNotification[]> {
    return (await adminNotificationRepository.findByAdminId(adminId, limit, skip)) as unknown as AdminNotification[];
  }

  /**
   * Get unread notification count for an admin
   */
  async getUnreadCount(adminId: number): Promise<number> {
    return await adminNotificationRepository.countUnread(adminId);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<AdminNotification> {
    return (await adminNotificationRepository.markAsRead(id)) as unknown as AdminNotification;
  }

  /**
   * Mark all notifications as read for an admin
   */
  async markAllAsRead(adminId: number): Promise<number> {
    const result = await adminNotificationRepository.markAllAsRead(adminId);
    return result?.count || 0;
  }

  /**
   * Get a specific notification
   */
  async getNotificationById(id: string): Promise<AdminNotification | null> {
    return (await adminNotificationRepository.findById(id)) as unknown as AdminNotification | null;
  }

  /**
   * Update a notification
   */
  async updateNotification(
    id: string,
    input: UpdateNotificationInput
  ): Promise<AdminNotification> {
    return (await adminNotificationRepository.update(id, input)) as unknown as AdminNotification;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<boolean> {
    return await adminNotificationRepository.delete(id);
  }

  /**
   * Delete all notifications for an admin
   */
  async deleteAllAdminNotifications(adminId: number): Promise<number> {
    const result = await adminNotificationRepository.deleteAll(adminId);
    return result?.count || 0;
  }

  /**
   * Get all notifications (admin view)
   */
  async getAllNotifications(limit?: number, skip?: number): Promise<AdminNotification[]> {
    return (await adminNotificationRepository.findAll(limit, skip)) as unknown as AdminNotification[];
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(type: string): Promise<AdminNotification[]> {
    const all = await adminNotificationRepository.findAll();
    return (all?.filter(n => n.type === type) || []) as unknown as AdminNotification[];
  }

  /**
   * Validate notification input
   */
  private validateNotificationInput(input: CreateNotificationInput): void {
    if (!input.adminId) {
      throw new Error('Admin ID is required');
    }
    if (!input.type?.trim()) {
      throw new Error('Notification type is required');
    }
    if (!input.title?.trim()) {
      throw new Error('Notification title is required');
    }
    if (!input.message?.trim()) {
      throw new Error('Notification message is required');
    }
  }
}

export const notificationService = new NotificationService();
