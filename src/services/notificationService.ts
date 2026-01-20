import { prisma } from '@/lib/db';
import type { Notification } from '@/lib/types/domain';

type CreateNotificationInput = Omit<Notification, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export const createNotification = async (userId: number, data: CreateNotificationInput): Promise<Notification> => {
  return (await prisma.notifications.create({ data: { ...data, userId } })) as unknown as Notification;
};

export const getUserNotifications = async (userId: number, unreadOnly: boolean = false): Promise<Notification[]> => {
  return (await prisma.notifications.findMany({
    where: { userId, ...(unreadOnly && { isRead: false }) },
    orderBy: { createdAt: 'desc' },
  })) as unknown as Notification[];
};

export const markAsRead = async (id: number): Promise<Notification> => {
  return (await prisma.notifications.update({ where: { id }, data: { isRead: true } })) as unknown as Notification;
};

export const deleteNotification = async (id: number): Promise<Notification> => {
  return (await prisma.notifications.delete({ where: { id } })) as unknown as Notification;
};
