import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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
          companies: { select: { name: true } },
        },
      },
      quoteLines: {
        include: {
          product: { select: { name: true, sku: true } },
        },
      },
    },
  });

  return quotes.map((quote) => ({
    id: quote.id.toString(),
    reference: quote.reference,
    status: quote.status,
    totalAmount: parseFloat(quote.totalAmount.toString()),
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    user: quote.user,
    quote_lines: quote.quoteLines.map((line) => ({
      id: line.id.toString(),
      quantity: line.quantity,
      unitPrice: parseFloat(line.unitPrice.toString()),
      product: line.product,
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
