'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';

/**
 * Approve a quote request
 * Admin action to approve pending quotes
 */
export async function approveQuote(quoteId: string, notes?: string) {
  try {
    // Verify admin session
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    const quote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'accepted',
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.analyticsEvent.create({
      data: {
        userId: parseInt(session.user.id, 10),
        eventType: 'quote_approved',
        data: JSON.stringify({ quoteId, notes }),
        source: 'admin-dashboard',
      },
    });

    revalidatePath('/admin');
    return { success: true, quote };
  } catch (error) {
    console.error('[QUOTE_APPROVE] Error:', error);
    return { error: 'Failed to approve quote' };
  }
}

/**
 * Reject a quote request
 * Admin action to reject pending quotes with reason
 */
export async function rejectQuote(quoteId: string, reason: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    const quote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'rejected',
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.analyticsEvent.create({
      data: {
        userId: parseInt(session.user.id, 10),
        eventType: 'quote_rejected',
        data: JSON.stringify({ quoteId, reason }),
        source: 'admin-dashboard',
      },
    });

    revalidatePath('/admin');
    return { success: true, quote };
  } catch (error) {
    console.error('[QUOTE_REJECT] Error:', error);
    return { error: 'Failed to reject quote' };
  }
}

/**
 * Update quote status
 * Admin action to manually change quote status
 */
export async function updateQuoteStatus(quoteId: string, status: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    const validStatuses = ['draft', 'pending', 'negotiating', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }

    const quote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status,
      },
    });

    revalidatePath('/admin');
    return { success: true, quote };
  } catch (error) {
    console.error('[QUOTE_UPDATE] Error:', error);
    return { error: 'Failed to update quote' };
  }
}

/**
 * Send quote to customer
 * Admin action to send quote via email
 */
export async function sendQuote(quoteId: string, customerEmail: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { user: true },
    });

    if (!quote) {
      return { error: 'Quote not found' };
    }

    // Log email activity
    await prisma.analyticsEvent.create({
      data: {
        userId: parseInt(session.user.id, 10),
        eventType: 'quote_sent',
        data: JSON.stringify({ quoteId, customerEmail }),
        source: 'admin-dashboard',
      },
    });

    // TODO: Integrate with email service (SendGrid, etc.)
    const DEBUG = process.env.DEBUG === 'true';
    if (DEBUG) {
      console.log(`[QUOTE_SEND] Quote ${quoteId} sent to ${customerEmail}`);
    }

    revalidatePath('/admin');
    return { success: true, message: 'Quote sent successfully' };
  } catch (error) {
    console.error('[QUOTE_SEND] Error:', error);
    return { error: 'Failed to send quote' };
  }
}

/**
 * Delete a quote
 * Admin action to delete quotes
 */
export async function deleteQuote(quoteId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    await prisma.quote.delete({
      where: { id: quoteId },
    });

    // Log activity
    await prisma.analyticsEvent.create({
      data: {
        userId: parseInt(session.user.id, 10),
        eventType: 'quote_deleted',
        data: JSON.stringify({ quoteId }),
        source: 'admin-dashboard',
      },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('[QUOTE_DELETE] Error:', error);
    return { error: 'Failed to delete quote' };
  }
}
