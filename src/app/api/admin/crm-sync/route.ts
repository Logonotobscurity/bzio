import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { errorLogger, createContext } from '@/lib/error-logger';
import { successResponse, unauthorized, forbidden, internalServerError } from '@/lib/api-response';

/**
 * GET /api/admin/crm-sync
 * Returns CRM sync data for the admin dashboard
 * Requires admin role
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const context = createContext()
    .withEndpoint('/api/admin/crm-sync')
    .withMethod('GET')
    .withRequestId(requestId);

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      errorLogger.warn('Unauthorized access attempt to CRM sync', context.build());
      return unauthorized('Admin access required');
    }

    // Add user ID to context
    context.withUserId(session.user.id);

    // Check admin role
    if (session.user.role !== 'admin') {
      errorLogger.warn(`Non-admin user ${session.user.id} attempted CRM sync access`, context.build());
      return forbidden('Admin access required');
    }
    errorLogger.info('Starting CRM sync data fetch', context.build());

    // Fetch all data in parallel for performance
    const [
      leads,
      forms,
      subscribers,
      unreadNotifications,
      totalLeads,
      totalForms,
      totalSubscribers,
    ] = await Promise.all([
      // Last 50 leads
      prisma.lead.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          type: true,
          status: true,
          leadScore: true,
          createdAt: true,
        },
      }),
      // Last 50 form submissions
      prisma.formSubmission.findMany({
        take: 50,
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          formType: true,
          data: true,
          status: true,
          submittedAt: true,
        },
      }),
      // Last 50 newsletter subscribers
      prisma.newsletterSubscriber.findMany({
        take: 50,
        orderBy: { subscribedAt: 'desc' },
        select: {
          id: true,
          email: true,
          source: true,
          subscribedAt: true,
        },
      }),
      // Unread notifications for BZION_HUB
      prisma.crmNotification.findMany({
        where: {
          read: false,
          targetSystem: 'BZION_HUB',
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          priority: true,
          read: true,
          createdAt: true,
        },
      }),
      // Count total leads
      prisma.lead.count(),
      // Count total form submissions
      prisma.formSubmission.count(),
      // Count total newsletter subscribers
      prisma.newsletterSubscriber.count(),
    ]);

    errorLogger.info('CRM sync data fetched successfully', context.build());

    // Extract email from form submission data
    const formsWithEmail = forms.map((form: typeof forms[number]) => {
      // Safely cast JSON data to access email property
      const formData = (form.data as Record<string, unknown>) || {};
      return {
        ...form,
        email: (formData.email as string) || (formData.mail as string) || 'N/A',
      };
    });

    // Calculate conversion rate (converted leads / total leads)
    const convertedLeads = leads.filter((l: typeof leads[number]) => l.status !== 'NEW').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    const stats = {
      totalLeads,
      totalForms,
      totalSubscribers,
      unreadNotifications: unreadNotifications.length,
      conversionRate,
    };

    return successResponse({
      stats,
      leads,
      forms: formsWithEmail,
      subscribers,
      notifications: unreadNotifications,
    });
  } catch (error) {
    errorLogger.error('Failed to fetch CRM sync data', error, context.build());
    return internalServerError('Failed to fetch CRM sync data');
  }
}
