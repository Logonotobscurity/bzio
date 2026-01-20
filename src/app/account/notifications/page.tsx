import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserNotifications } from '../_actions/dashboard';
import NotificationsClient from './NotificationsClient';

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/notifications');
  }

  const userId = parseInt(session.user.id as string);
  const notifications = await getUserNotifications(userId, 50);

  return <NotificationsClient notifications={notifications} />;
}
