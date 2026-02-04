import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/ratelimit';
import { formService } from '@/services';
import { VALID_FORM_TYPES } from '@/lib/constants/form-types';

const formSubmissionSchema = z.object({
  formType: z.enum(VALID_FORM_TYPES),
  email: z.string().email(),
  name: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
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

    const body = await request.json();
    const validated = formSubmissionSchema.parse(body);

    const result = await formService.processSubmission({
      formType: validated.formType, email: validated.email, ...validated,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully', id: result.formSubmission.id },
      { status: 201, headers: rateLimitHeaders }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    console.error('[FORMS_SUBMIT_API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
