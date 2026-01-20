/**
 * Form Submission Repository
 * 
 * Data access layer for Form Submission entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';
import { mapFormSubmissionRow, mapArrayIds } from './db/adapter';

type FormSubmission = Prisma.form_submissionsGetPayload<{}>;

interface CreateFormSubmissionInput {
  formType: string;
  data: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
}

interface UpdateFormSubmissionInput {
  status?: string;
  data?: Prisma.InputJsonValue;
}

export class FormSubmissionRepository extends BaseRepository<FormSubmission, CreateFormSubmissionInput, UpdateFormSubmissionInput> {
  async findAll(limit?: number, skip?: number) {
    try {
      const rows = await prisma.form_submissions.findMany({
        take: limit,
        skip,
        // use createdAt ordering which exists on generated client
        orderBy: { createdAt: 'desc' },
      });
      return (mapArrayIds(rows) as unknown) as FormSubmission[];
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number) {
    try {
      const row = await prisma.form_submissions.findUnique({
        where: { id: Number(id) },
      });
      return row ? mapFormSubmissionRow(row) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateFormSubmissionInput) {
    try {
      const row = await prisma.form_submissions.create({
        data: {
          formType: data.formType,
          data: data.data,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          status: data.status ? (data.status as any) : ('NEW' as any),
        },
      });
      return mapFormSubmissionRow(row);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateFormSubmissionInput) {
    try {
      const row = await prisma.form_submissions.update({
        where: { id: Number(id) },
        data,
      });
      return mapFormSubmissionRow(row);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number) {
    try {
      await prisma.form_submissions.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async findByStatus(status: string, limit?: number, skip?: number) {
    try {
      const rows = await prisma.form_submissions.findMany({
        where: { status: (status as any) },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      });
      return (mapArrayIds(rows) as unknown) as FormSubmission[];
    } catch (error) {
      this.handleError(error, 'findByStatus');
    }
  }

  async findPending(limit?: number, skip?: number) {
    try {
      const rows = await prisma.form_submissions.findMany({
        where: { status: ('NEW' as any) },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      });
      return (mapArrayIds(rows) as unknown) as FormSubmission[];
    } catch (error) {
      this.handleError(error, 'findPending');
    }
  }

  async count() {
    try {
      return await prisma.form_submissions.count();
    } catch (error) {
      this.handleError(error, 'count');
    }
  }
}

export const formSubmissionRepository = new FormSubmissionRepository();
