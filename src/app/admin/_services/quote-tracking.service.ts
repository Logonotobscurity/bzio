/**
 * Quote Tracking Service
 * 
 * Handles quote-related event tracking and notifications
 */

import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-service';
import { broadcastAdminNotification } from '../_actions/notifications';

export interface QuoteTrackingData {
  quoteId: string;
  reference: string;
  amount?: number;
  status: string;
  userEmail: string;
  userName?: string;
}

/**
 * Track quote request event
 */
export async function trackQuoteRequest(data: QuoteTrackingData): Promise<void> {
  try {
    // Log the activity (logActivity: userId, eventType, data)
    await logActivity(
      0, // System event (no specific user)
      'quote_request',
      {
        quoteId: data.quoteId,
        reference: data.reference,
        amount: data.amount,
        status: data.status,
        userEmail: data.userEmail,
      }
    );

    // Broadcast notification to admins (broadcastAdminNotification: type, title, message, data, actionUrl)
    await broadcastAdminNotification(
      'quote_request',
      'New Quote Request',
      `Quote ${data.reference} from ${data.userName || data.userEmail}`,
      {
        quoteId: data.quoteId,
        reference: data.reference,
        amount: data.amount,
      }
    );

    console.log(`[Quote Tracking] Quote ${data.reference} tracked successfully`);
  } catch (error) {
    console.error('[Quote Tracking Error]', error);
    throw error;
  }
}

/**
 * Track quote status change
 */
export async function trackQuoteStatusChange(
  quoteId: string,
  reference: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  try {
    await logActivity(
      0, // System event
      'quote_request',
      {
        quoteId,
        reference,
        oldStatus,
        newStatus,
      }
    );

    await broadcastAdminNotification(
      'quote_status_change',
      'Quote Status Updated',
      `Quote ${reference} is now ${newStatus}`,
      {
        quoteId,
        reference,
        oldStatus,
        newStatus,
      }
    );

    console.log(`[Quote Tracking] Status change tracked for ${reference}`);
  } catch (error) {
    console.error('[Quote Tracking Error]', error);
    throw error;
  }
}

/**
 * Get quote metrics
 */
export async function getQuoteMetrics(): Promise<{
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}> {
  try {
    const [total, pending, accepted, rejected] = await Promise.all([
      prisma.quotes.count(),
      prisma.quotes.count({ where: { status: "PENDING" } }),
      prisma.quotes.count({ where: { status: 'accepted' } }),
      prisma.quotes.count({ where: { status: 'rejected' } }),
    ]);

    return { total, pending, accepted, rejected };
  } catch (error) {
    console.error('[Quote Metrics Error]', error);
    throw error;
  }
}
