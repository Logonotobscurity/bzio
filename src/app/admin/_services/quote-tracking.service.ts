import { prisma } from '@/lib/db';
import { broadcastAdminNotification } from '../_actions/notifications';
import { QuoteStatus } from '@prisma/client';

export async function trackNewQuote(quoteId: number) {
  try {
    const quote = await prisma.quotes.findUnique({
      where: { id: quoteId },
      include: { users: true }
    });

    if (!quote) return;

    await broadcastAdminNotification(
      'NEW_QUOTE',
      `New Quote Request: ${quote.reference}`,
      `Quote request from ${quote.users?.email || 'Customer'}`,
      {
          quoteId: String(quote.id),
          reference: quote.reference,
      },
      `/admin?tab=quotes&id=${quote.id}`
    );
  } catch (error) {
    console.error('Error tracking new quote:', error);
  }
}

export async function trackQuoteStatusChange(quoteId: number, oldStatus: QuoteStatus, newStatus: QuoteStatus) {
  try {
    const quote = await prisma.quotes.findUnique({
      where: { id: quoteId }
    });

    if (!quote) return;

    await broadcastAdminNotification(
      'INFO',
      `Quote Status Changed: ${quote.reference}`,
      `Status changed from ${oldStatus} to ${newStatus}`,
      {
          quoteId: String(quote.id),
          reference: quote.reference,
          oldStatus,
          newStatus,
      },
      `/admin?tab=quotes&id=${quote.id}`
    );
  } catch (error) {
    console.error('Error tracking quote status change:', error);
  }
}
