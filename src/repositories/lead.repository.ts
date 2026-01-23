/**
 * Lead Repository
 * 
 * Data access layer for Lead entity (CRM)
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma, LeadSource, LeadStatus } from '@prisma/client';

type Lead = Prisma.leadsGetPayload<{}>;

interface CreateLeadInput {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  company?: string;
  phone?: string;
  source?: LeadSource | string;
  status?: LeadStatus | string;
  notes?: string;
}

interface UpdateLeadInput {
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  status?: LeadStatus | string;
  notes?: string;
  score?: number;
}

export class LeadRepository extends BaseRepository<Lead, CreateLeadInput, UpdateLeadInput> {
  async findAll(limit?: number, skip?: number) {
    try {
      return await prisma.leads.findMany({
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
      return await prisma.leads.findUnique({
        where: { id: Number(id) },
      });
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async findByEmail(email: string) {
    try {
      return await prisma.leads.findFirst({
        where: { email },
      });
    } catch (error) {
      this.handleError(error, 'findByEmail');
    }
  }

  async create(data: CreateLeadInput) {
    try {
      const [firstName, lastName] = data.name ? data.name.split(' ') : [data.firstName, data.lastName];

      return await prisma.leads.create({
        data: {
          email: data.email,
          firstName: firstName || data.firstName,
          lastName: lastName || data.lastName,
          company: data.company,
          phone: data.phone,
          source: (data.source as LeadSource) || 'WEBSITE',
          status: (data.status as LeadStatus) || 'NEW',
          notes: data.notes,
        },
      });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateLeadInput) {
    try {
      return await prisma.leads.update({
        where: { id: Number(id) },
        data: {
          ...data,
          status: (data.status as LeadStatus) || undefined,
        },
      });
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string | number) {
    try {
      await prisma.leads.delete({
        where: { id: Number(id) },
      });
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async count(where?: Record<string, unknown>) {
    try {
      return await prisma.leads.count({ where });
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Find by status
   */
  async findByStatus(status: string, limit?: number) {
    try {
      return await prisma.leads.findMany({
        where: { status: (status || '').toUpperCase() as LeadStatus },
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
      return await prisma.leads.findMany({
        where: { source: (source || '').toUpperCase() as LeadSource },
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
      return await prisma.leads.count({
        where: { status: (status || '').toUpperCase() as LeadStatus },
      });
    } catch (error) {
      this.handleError(error, 'countByStatus');
    }
  }
}

export const leadRepository = new LeadRepository();
