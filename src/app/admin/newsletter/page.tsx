import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { USER_ROLES } from '@/lib/auth-constants';
import NewsletterClient from './NewsletterClient';

async function getNewsletterData() {
  const subscribers = await prisma.newsletter_subscribers.findMany({
    orderBy: { subscribedAt: 'desc' },
  });

  return subscribers.map((sub) => ({
    id: sub.id.toString(),
    email: sub.email,
    firstName: sub.firstName,
    lastName: sub.lastName,
    isActive: sub.isActive,
    subscribedAt: sub.subscribedAt,
    unsubscribedAt: sub.unsubscribedAt,
  }));
}

export default async function NewsletterPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/newsletter');
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== USER_ROLES.ADMIN) {
    redirect('/403');
  }

  const subscribers = await getNewsletterData();

  return <NewsletterClient subscribers={subscribers} />;
}
