/**
 * Lead Repository
 * 
 * Data access layer for Lead entity (CRM)
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';

type Lead = Prisma.LeadGetPayload<{}>;

interface CreateLeadInput {
  email: string;
  name?: string;
  companyName?: string;
  phone?: string;
  type: string;
  source: string;
  status?: string;
  metadata?: Prisma.InputJsonValue;
}

interface UpdateLeadInput {
  name?: string;
  companyName?: string;
  phone?: string;
  type?: string;
  status?: string;
  metadata?: Prisma.InputJsonValue;
  assignedTo?: string;
  convertedAt?: Date;
}

export class LeadRepository extends BaseRepository<Lead, CreateLeadInput, UpdateLeadInput> {
  async findAll(limit?: number, skip?: number) {
    try {
      return await prisma.lead.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findAll');
    }
  }

  async findById(id: string | number) {
    try {
      return await prisma.lead.findUnique({
        where: { id: String(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByEmail(email: string) {
    try {
      return await prisma.lead.findFirst({
        where: { email },
      });
    } catch (error) {
      this.handleError(error, 'findByEmail');
    }
  }

  async create(data: CreateLeadInput) {
    try {
      return await prisma.lead.create({
        data: {
          email: data.email,
          name: data.name,
          companyName: data.companyName,
          phone: data.phone,
          type: data.type,
          source: data.source,
          status: data.status || 'NEW',
          metadata: data.metadata,
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateLeadInput) {
    try {
      return await prisma.lead.update({
        where: { id: String(id) },
        data,
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number) {
    try {
      await prisma.lead.delete({
        where: { id: String(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>) {
    try {
      return await prisma.lead.count({ where });
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Find by status
   */
  async findByStatus(status: string, limit?: number) {
    try {
      return await prisma.lead.findMany({
        where: { status },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findByStatus');
    }
  }

  /**
   * Find by source
   */
  async findBySource(source: string, limit?: number) {
    try {
      return await prisma.lead.findMany({
        where: { source },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError(error, 'findBySource');
    }
  }

  /**
   * Count by status
   */
  async countByStatus(status: string) {
    try {
      return await prisma.lead.count({
        where: { status },
      });
    } catch (error) {
      this.handleError(error, 'countByStatus');
    }
  }
}

export const leadRepository = new LeadRepository();
