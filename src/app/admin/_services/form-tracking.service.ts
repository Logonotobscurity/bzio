/**
 * Form Tracking Service
 * 
 * Handles form submission tracking and notifications
 */

import { prisma } from '@/lib/db';
import { logActivity, type ActivityType } from '@/lib/activity-service';
import { broadcastAdminNotification } from '../_actions/notifications';

export interface FormSubmissionData {
  formType: string;
  email: string;
  name?: string;
  phone?: string;
  message?: string;
  companyName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Track form submission
 */
export async function trackFormSubmission(data: FormSubmissionData): Promise<void> {
  try {
    const displayName = data.name || data.email;

    await logActivity(
      undefined as unknown as number,
      'form_submission' as ActivityType,
      {
        formType: data.formType,
        email: data.email,
        name: data.name,
        companyName: data.companyName,
        message: `New ${data.formType} submission from ${displayName}`,
      }
    );

    await broadcastAdminNotification(
      'new_form',
      `New ${data.formType} Submission`,
      `${displayName} submitted a ${data.formType} form`,
      {
        formType: data.formType,
        email: data.email,
        name: data.name || null,
        companyName: data.companyName || null,
      }
    );

    console.log(`[Form Tracking] ${data.formType} from ${data.email} tracked successfully`);
  } catch (error) {
    console.error('[Form Tracking Error]', error);
    throw error;
  }
}

/**
 * Get form submission metrics
 */
export async function getFormMetrics(): Promise<{
  totalSubmissions: number;
  contactForms: number;
  quoteForms: number;
  otherForms: number;
}> {
  try {
    const total = await prisma.formSubmission.count();
    const contactForms = await prisma.formSubmission.count({
      where: { formType: 'contact' },
    });
    const quoteForms = await prisma.formSubmission.count({
      where: { formType: 'quote_request' },
    });

    return {
      totalSubmissions: total,
      contactForms,
      quoteForms,
      otherForms: total - contactForms - quoteForms,
    };
  } catch (error) {
    console.error('[Form Metrics Error]', error);
    throw error;
  }
}

/**
 * Get recent form submissions
 */
export async function getRecentFormSubmissions(limit: number = 10) {
  try {
    return await prisma.formSubmission.findMany({
      take: limit,
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        formType: true,
        data: true,
        submittedAt: true,
        status: true,
      },
    });
  } catch (error) {
    console.error('[Form Submissions Error]', error);
    throw error;
  }
}
