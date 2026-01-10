/**
 * Admin Notification Service
 *
 * Business logic layer for admin notifications.
 * Handles notification creation, management, and delivery.
 */

import { adminNotificationRepository } from '@/repositories';
import type { AdminNotification } from '@/lib/types/domain';

interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

interface UpdateNotificationInput {
  isRead?: boolean;
  data?: Record<string, unknown>;
}

export class NotificationService {
  /**
   * Create a new notification for a user
   */
  async createNotification(input: CreateNotificationInput): Promise<AdminNotification> {
    // Validate input
    this.validateNotificationInput(input);

    return adminNotificationRepository.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
      isRead: false,
    });
  }

  /**
   * Create bulk notifications for multiple users
   */
  async createBulkNotifications(
    userIds: string[],
    input: Omit<CreateNotificationInput, 'userId'>
  ): Promise<AdminNotification[]> {
    const notifications = await Promise.all(
      userIds.map(userId => this.createNotification({ ...input, userId }))
    );
    return notifications;
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(
    userId: string,
    limit?: number,
    skip?: number
  ): Promise<AdminNotification[]> {
    return adminNotificationRepository.findByUserId(userId, limit, skip);
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return adminNotificationRepository.countUnread(userId);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string | number): Promise<AdminNotification> {
    return adminNotificationRepository.markAsRead(id);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    return adminNotificationRepository.markAllAsRead(userId);
  }

  /**
   * Get a specific notification
   */
  async getNotificationById(id: string | number): Promise<AdminNotification | null> {
    return adminNotificationRepository.findById(id);
  }

  /**
   * Update a notification
   */
  async updateNotification(
    id: string | number,
    input: UpdateNotificationInput
  ): Promise<AdminNotification> {
    return adminNotificationRepository.update(id, input);
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string | number): Promise<boolean> {
    return adminNotificationRepository.delete(id);
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllUserNotifications(userId: string): Promise<number> {
    return adminNotificationRepository.deleteAll(userId);
  }

  /**
   * Get all notifications (admin)
   */
  async getAllNotifications(limit?: number, skip?: number): Promise<AdminNotification[]> {
    return adminNotificationRepository.findAll(limit, skip);
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(type: string): Promise<AdminNotification[]> {
    const all = await adminNotificationRepository.findAll();
    return all.filter(n => n.type === type);
  }

  /**
   * Validate notification input
   */
  private validateNotificationInput(input: CreateNotificationInput): void {
    if (!input.userId?.trim()) {
      throw new Error('User ID is required');
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
