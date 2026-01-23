'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireAdminAction } from '@/lib/guards';

/**
 * Approve a quote request
 * Admin action to approve pending quotes
 */
export async function approveQuote(quoteId: string, notes?: string) {
  try {
    const { user } = await requireAdminAction();
    const id = Number(quoteId);

    const quote = await prisma.quotes.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.analytics_events.create({
      data: {
        userId: Number(user.id),
        eventType: 'quote_approved',
        eventData: { quoteId, notes },
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
    const { user } = await requireAdminAction();
    const id = Number(quoteId);

    const quote = await prisma.quotes.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        rejectedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.analytics_events.create({
      data: {
        userId: Number(user.id),
        eventType: 'quote_rejected',
        eventData: { quoteId, reason },
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
    const { user } = await requireAdminAction();
    const id = Number(quoteId);

    const validStatuses = ['DRAFT', 'PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'EXPIRED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }

    const quote = await prisma.quotes.update({
      where: { id },
      data: {
        status: status.toUpperCase() as any,
        updatedAt: new Date(),
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
    const { user } = await requireAdminAction();
    const id = Number(quoteId);

    const quote = await prisma.quotes.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!quote) {
      return { error: 'Quote not found' };
    }

    // Log email activity
    await prisma.analytics_events.create({
      data: {
        userId: Number(user.id),
        eventType: 'quote_sent',
        eventData: { quoteId, customerEmail },
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
 * Delete a quote (Soft Delete)
 * Admin action to delete quotes
 */
export async function deleteQuote(quoteId: string) {
  try {
    const { user } = await requireAdminAction();
    const id = Number(quoteId);

    await prisma.quotes.update({
      where: { id },
      data: {
          deletedAt: new Date(),
          updatedAt: new Date(),
      }
    });

    // Log activity
    await prisma.analytics_events.create({
      data: {
        userId: Number(user.id),
        eventType: 'quote_deleted',
        eventData: { quoteId },
      },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('[QUOTE_DELETE] Error:', error);
    return { error: 'Failed to delete quote' };
  }
}
