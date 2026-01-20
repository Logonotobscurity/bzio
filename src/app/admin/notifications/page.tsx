import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { USER_ROLES } from '@/lib/auth-constants';
import NotificationsClient from './NotificationsClient';

async function getNotificationsData() {
  const notifications = await prisma.admin_notifications.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return notifications.map((notif) => ({
    id: notif.id.toString(),
    title: notif.title,
    message: notif.message,
    type: notif.type,
    isRead: notif.isRead,
    data: notif.data as Record<string, unknown> | null,
    createdAt: notif.createdAt,
  }));
}

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/notifications');
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== USER_ROLES.ADMIN) {
    redirect('/403');
  }

  const notifications = await getNotificationsData();

  return <NotificationsClient notifications={notifications} />;
}
