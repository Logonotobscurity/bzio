import { prisma } from '@/lib/db';
import { broadcastAdminNotification } from '../_actions/notifications';

export async function trackFormSubmission(data: {
  id: number;
  formType: string;
  email?: string;
  name?: string;
}) {
  try {
    await broadcastAdminNotification(
      'INFO',
      `New Form Submission: ${data.formType}`,
      `Form submitted by ${data.name || data.email || 'Anonymous'}`,
      {
          formId: String(data.id),
          formType: data.formType,
      },
      `/admin?tab=forms&id=${data.id}`
    );
  } catch (error) {
    console.error('Error tracking form submission:', error);
  }
}

export async function getRecentSubmissions(limit = 10) {
  return prisma.form_submissions.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}
