import { prisma } from '@/lib/db';
import { formSubmissionRepository } from '@/repositories';
import {
  VALID_FORM_TYPES,
  LEAD_SCORE_MAP,
  getLeadTypeForFormType,
  getNotificationPriority,
  FormType
} from '@/lib/constants/form-types';
import { trackFormSubmission } from '@/app/admin/_actions/tracking';
import { broadcastAdminNotification } from '@/app/admin/_actions/notifications';

export class FormService {
  /**
   * Process a form submission with lead scoring and notifications
   */
  async processSubmission(input: {
    formType: string;
    email: string;
    name?: string;
    companyName?: string;
    phone?: string;
    message?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { formType, email, name, companyName, phone, message, metadata, ipAddress, userAgent } = input;

    // Calculate lead score
    const leadScore = LEAD_SCORE_MAP[formType as FormType] || 50;
    const notificationPriority = getNotificationPriority(leadScore);

    // Create records in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create form submission
      const formSubmission = await tx.formSubmission.create({
        data: {
          formType,
          data: { email, name, companyName, phone, message, ...metadata },
          ipAddress,
          userAgent,
          status: 'NEW',
        },
      });

      // 2. Create lead
      const lead = await tx.lead.create({
        data: {
          email,
          name,
          companyName,
          phone,
          type: getLeadTypeForFormType(formType as FormType),
          source: 'web_form',
          status: 'NEW',
          leadScore,
          metadata: {
            formSubmissionId: formSubmission.id,
            formType,
            ...metadata,
          },
        },
      });

      // 3. Create CRM notification
      const notification = await tx.crmNotification.create({
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
            ipAddress,
          },
        },
      });

      return { formSubmission, lead, notification };
    });

    // Async tracking and notifications
    try {
      await trackFormSubmission({
        formSubmissionId: result.formSubmission.id,
        formType,
        email,
        name: name || 'Unknown',
      });

      await broadcastAdminNotification(
        'new_form',
        `New Form Submission: ${formType}`,
        `${name || 'Unknown'} (${email}) submitted a ${formType.replace('_', ' ')} form`,
        {
          formSubmissionId: result.formSubmission.id,
          leadId: result.lead.id,
          formType,
          customerName: name,
          customerEmail: email,
        },
        `/admin?tab=forms&id=${result.formSubmission.id}`
      );
    } catch (error) {
      console.error('[FormService] Post-processing error:', error);
    }

    return result;
  }

  async getAllSubmissions(limit?: number, skip?: number) {
    return formSubmissionRepository.findAll(limit, skip);
  }

  async getSubmissionById(id: string) {
    return formSubmissionRepository.findById(id);
  }

  async updateSubmission(id: string, data: any) {
    return formSubmissionRepository.update(id, data);
  }

  async deleteSubmission(id: string) {
    return formSubmissionRepository.delete(id);
  }

  async respondToSubmission(id: string, response: string, respondedBy: string) {
    return formSubmissionRepository.update(id, {
      status: 'responded',
      // Store response in data JSON
    });
  }
}

export const formService = new FormService();
