import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/ratelimit';
import {
  VALID_FORM_TYPES,
  LEAD_SCORE_MAP,
  getNotificationPriority,
} from '@/lib/constants/form-types';
import { trackFormSubmission } from '@/app/admin/_actions/tracking';
import { broadcastAdminNotification } from '@/app/admin/_actions/notifications';

const formSubmissionSchema = z.object({
  formType: z.enum(VALID_FORM_TYPES as any, {
    errorMap: () => ({
      message: `formType must be one of: ${VALID_FORM_TYPES.join(', ')}`,
    }),
  }),
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  // Allow additional fields
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success: rateLimitSuccess, headers: rateLimitHeaders } = await checkRateLimit(ip, 'api');

    if (!rateLimitSuccess) {
      return NextResponse.json(
        { success: false, error: 'Too many form submissions. Please try again later.' },
        { status: 429, headers: rateLimitHeaders }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = formSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors.map(e => e.message).join(', '),
        },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const { formType, email, name, companyName, phone, message, metadata } = validation.data;

    // Prepare form submission data
    const formSubmissionData = {
      formType,
      data: {
        email,
        name,
        companyName,
        phone,
        message,
        ...metadata,
      },
      status: 'NEW' as const,
    };

    // Calculate lead score based on form type
    const leadScore = LEAD_SCORE_MAP[formType] || 50;
    const notificationPriority = getNotificationPriority(leadScore);

    // Create all records in a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      const formSubmission = await tx.form_submissions.create({ data: formSubmissionData as any });

      const [firstName, lastName] = name ? name.split(' ') : [undefined, undefined];

      const lead = await tx.leads.create({
        data: {
          email,
          firstName,
          lastName,
          company: companyName,
          phone,
          source: 'WEBSITE',
          status: 'NEW',
          score: leadScore,
          notes: `Form Type: ${formType}. ${message || ''}`,
        } as any,
      });

      const notification = await tx.crm_notifications.create({
        data: {
          type: 'NEW_FORM_SUBMISSION',
          targetSystem: 'BZION_HUB',
          priority: notificationPriority,
          data: {
            formSubmissionId: formSubmission.id,
            leadId: lead.id,
            formType,
            email,
            name,
            companyName,
            phone,
            leadScore,
            submittedAt: new Date().toISOString(),
            ipAddress: ip,
          },
        } as any,
      });

      return { formSubmission, lead, notification };
    });

    // Track form submission (async - non-blocking)
    try {
      await trackFormSubmission({
        formSubmissionId: String(result.formSubmission.id),
        formType,
        email,
        name: name || 'Unknown',
      });
    } catch (trackingError) {
      console.error('❌ Failed to track form submission:', trackingError);
    }

    // Notify admins about new form submission (async - non-blocking)
    try {
      await broadcastAdminNotification(
        'INFO',
        `New Form Submission: ${formType}`,
        `${name || 'Unknown'} (${email}) submitted a ${formType.replace('_', ' ')} form`,
        {
          formSubmissionId: String(result.formSubmission.id),
          leadId: String(result.lead.id),
          formType,
          customerName: name,
          customerEmail: email,
        },
        `/admin?tab=forms&id=${result.formSubmission.id}`
      );
    } catch (notificationError) {
      console.error('❌ Failed to send admin notifications:', notificationError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Form submitted successfully',
      },
      { status: 201, headers: rateLimitHeaders }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Form submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
