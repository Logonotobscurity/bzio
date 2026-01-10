/**
 * Form Submission Repository
 * 
 * Data access layer for Form Submission entity
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';

type FormSubmission = Prisma.FormSubmissionGetPayload<{}>;

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
      return await prisma.formSubmission.findMany({
        take: limit,
        skip,
        orderBy: { submittedAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number) {
    try {
      return await prisma.formSubmission.findUnique({
        where: { id: String(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateFormSubmissionInput) {
    try {
      return await prisma.formSubmission.create({
        data: {
          formType: data.formType,
          data: data.data,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          status: data.status || 'NEW',
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateFormSubmissionInput) {
    try {
      return await prisma.formSubmission.update({
        where: { id: String(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number) {
    try {
      await prisma.formSubmission.delete({
        where: { id: String(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async findByStatus(status: string, limit?: number, skip?: number) {
    try {
      return await prisma.formSubmission.findMany({
        where: { status },
        take: limit,
        skip,
        orderBy: { submittedAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findByStatus');
    }
  }

  async findPending(limit?: number, skip?: number) {
    try {
      return await prisma.formSubmission.findMany({
        where: { status: 'NEW' },
        take: limit,
        skip,
        orderBy: { submittedAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findPending');
    }
  }

  async count() {
    try {
      return await prisma.formSubmission.count();
    } catch (error) {
      this.handleError(error, 'count');
    }
  }
}

export const formSubmissionRepository = new FormSubmissionRepository();
