/**
 * Form Service
 *
 * Business logic layer for form submissions.
 * Handles submission validation, processing, and notifications.
 */

import { formSubmissionRepository } from '@/repositories';
import type { FormSubmission } from '@/lib/types/domain';

interface CreateFormInput {
  companyName: string;
  contactEmail: string;
  phone?: string;
  subject: string;
  message: string;
  formType: string;
}

interface UpdateFormInput {
  status?: string;
  response?: string;
  respondedAt?: Date;
  respondedBy?: string;
}

export class FormService {
  /**
   * Submit a new form
   */
  async submitForm(input: CreateFormInput): Promise<FormSubmission> {
    // Validate input
    this.validateFormInput(input);

    // Create submission via repository
    const submission = await formSubmissionRepository.create(input);

    // TODO: Send notification email to admin
    // await notificationService.notifyFormSubmission(submission);

    return submission;
  }

  /**
   * Get all form submissions
   */
  async getAllSubmissions(limit?: number, skip?: number): Promise<FormSubmission[]> {
    return formSubmissionRepository.findAll(limit, skip);
  }

  /**
   * Get a specific form submission
   */
  async getSubmissionById(id: string | number): Promise<FormSubmission | null> {
    return formSubmissionRepository.findById(id);
  }

  /**
   * Get pending form submissions
   */
  async getPendingSubmissions(): Promise<FormSubmission[]> {
    return formSubmissionRepository.findPending();
  }

  /**
   * Get submissions by status
   */
  async getSubmissionsByStatus(status: string): Promise<FormSubmission[]> {
    return formSubmissionRepository.findByStatus(status);
  }

  /**
   * Respond to a form submission
   */
  async respondToSubmission(
    id: string | number,
    response: string,
    respondedBy: string
  ): Promise<FormSubmission> {
    const submission = await formSubmissionRepository.update(id, {
      status: 'responded',
      response,
      respondedBy,
      respondedAt: new Date(),
    });

    // TODO: Send response email to submitter
    // await notificationService.sendFormResponse(submission);

    return submission;
  }

  /**
   * Update a form submission
   */
  async updateSubmission(
    id: string | number,
    input: UpdateFormInput
  ): Promise<FormSubmission> {
    return formSubmissionRepository.update(id, input);
  }

  /**
   * Delete a form submission
   */
  async deleteSubmission(id: string | number): Promise<boolean> {
    return formSubmissionRepository.delete(id);
  }

  /**
   * Get total submission count
   */
  async getSubmissionCount(): Promise<number> {
    return formSubmissionRepository.count();
  }

  /**
   * Validate form input
   */
  private validateFormInput(input: CreateFormInput): void {
    if (!input.companyName?.trim()) {
      throw new Error('Company name is required');
    }
    if (!input.contactEmail?.trim()) {
      throw new Error('Contact email is required');
    }
    if (!input.subject?.trim()) {
      throw new Error('Subject is required');
    }
    if (!input.message?.trim()) {
      throw new Error('Message is required');
    }
    if (!input.formType?.trim()) {
      throw new Error('Form type is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.contactEmail)) {
      throw new Error('Invalid email format');
    }
  }
}

export const formService = new FormService();
