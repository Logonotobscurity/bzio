import prisma from '@/lib/prisma';
import type { Notification } from '@prisma/client';

type CreateNotificationInput = Omit<Notification, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export const createNotification = async (userId: number, data: CreateNotificationInput): Promise<Notification> => {
  return prisma.notification.create({
    data: { ...data, userId },
  });
};

export const getUserNotifications = async (userId: number, unreadOnly: boolean = false): Promise<Notification[]> => {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly && { isRead: false }) },
    orderBy: { createdAt: 'desc' },
  });
};

export const markAsRead = async (id: number): Promise<Notification> => {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

export const deleteNotification = async (id: number): Promise<Notification> => {
  return prisma.notification.delete({
    where: { id },
  });
};
