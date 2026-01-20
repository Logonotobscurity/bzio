import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserQuotes } from '../_actions/dashboard';
import QuotesClient from './QuotesClient';

export default async function QuotesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/quotes');
  }

  const userId = parseInt(session.user.id as string);
  const quotes = await getUserQuotes(userId, 20);

  return <QuotesClient quotes={quotes} />;
}
