'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';

/**
 * Respond to a form submission
 * Admin action to mark forms as responded
 */
export async function respondToFormSubmission(formId: string, response: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    const submission = await prisma.formSubmission.update({
      where: { id: formId },
      data: {
        status: 'responded',
      },
    });

    // Log activity
    await prisma.analyticsEvent.create({
      data: {
        userId: parseInt(session.user.id, 10),
        eventType: 'form_submission_responded',
        data: JSON.stringify({ formId, responsePreview: response.substring(0, 100) }),
        source: 'admin-dashboard',
      },
    });

    revalidatePath('/admin');
    return { success: true, submission };
  } catch (error) {
    console.error('[FORM_RESPOND] Error:', error);
    return { error: 'Failed to respond to form submission' };
  }
}

/**
 * Mark form submission as spam
 * Admin action to flag submissions as spam
 */
export async function markFormAsSpam(formId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    const submission = await prisma.formSubmission.update({
      where: { id: formId },
      data: {
        status: 'spam',
      },
    });

    revalidatePath('/admin');
    return { success: true, submission };
  } catch (error) {
    console.error('[FORM_SPAM] Error:', error);
    return { error: 'Failed to mark form as spam' };
  }
}

/**
 * Delete a form submission
 * Admin action to delete forms
 */
export async function deleteFormSubmission(formId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    await prisma.formSubmission.delete({
      where: { id: formId },
    });

    // Log activity
    await prisma.analyticsEvent.create({
      data: {
        userId: parseInt(session.user.id, 10),
        eventType: 'form_submission_deleted',
        data: JSON.stringify({ formId }),
        source: 'admin-dashboard',
      },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('[FORM_DELETE] Error:', error);
    return { error: 'Failed to delete form submission' };
  }
}

/**
 * Update form submission status
 * Admin action to change form status
 */
export async function updateFormStatus(formId: string, status: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    const validStatuses = ['new', 'read', 'responded', 'spam', 'archived'];
    if (!validStatuses.includes(status)) {
      return { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }

    const submission = await prisma.formSubmission.update({
      where: { id: formId },
      data: {
        status,
      },
    });

    revalidatePath('/admin');
    return { success: true, submission };
  } catch (error) {
    console.error('[FORM_UPDATE] Error:', error);
    return { error: 'Failed to update form status' };
  }
}

/**
 * Archive form submission
 * Admin action to archive forms
 */
export async function archiveFormSubmission(formId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin access required' };
    }

    const submission = await prisma.formSubmission.update({
      where: { id: formId },
      data: {
        status: 'archived',
      },
    });
    revalidatePath('/admin');
    return { success: true, submission };
  } catch (error) {
    console.error('[FORM_ARCHIVE] Error:', error);
    return { error: 'Failed to archive form' };
  }
}
