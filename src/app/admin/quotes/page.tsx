import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { USER_ROLES } from '@/lib/auth-constants';
import QuotesClient from './QuotesClient';

async function getQuotesData() {
  const quotes = await prisma.quotes.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      users: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          organization: { select: { name: true } },
        },
      },
      quote_lines: {
        include: {
          products: { select: { name: true, sku: true } },
        },
      },
    },
  });

  return quotes.map((quote: any) => ({
    id: quote.id.toString(),
    reference: quote.reference,
    status: quote.status,
    totalAmount: parseFloat(quote.totalAmount.toString()),
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    user: quote.users,
    quote_lines: (quote.quote_lines || []).map((line: any) => ({
      id: line.id.toString(),
      quantity: line.quantity,
      unitPrice: parseFloat(line.unitPrice?.toString() || '0'),
      product: line.products,
    })),
  }));
}

export default async function QuotesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== USER_ROLES.ADMIN) {
    redirect('/403');
  }

  const quotes = await getQuotesData();

  return <QuotesClient quotes={quotes} />;
}
