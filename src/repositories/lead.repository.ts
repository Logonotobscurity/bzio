/**
 * Lead Repository
 * 
 * Data access layer for Lead entity (CRM)
 */

import { prisma } from '@/lib/db';
import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';

type Lead = Prisma.leadsGetPayload<{}>;

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
      const createData: any = {
        email: data.email,
        name: data.name,
        companyName: data.companyName,
        phone: data.phone,
        type: data.type,
        // map to Prisma enum shape at runtime (cast to any to avoid generated enum name mismatch)
        source: (data.source || 'WEB').toString().toUpperCase() as any,
        status: (data.status || 'NEW').toString().toUpperCase() as any,
        metadata: data.metadata,
      };

      return await prisma.leads.create({ data: createData });
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string | number, data: UpdateLeadInput) {
    try {
      const updateData: any = { ...data };
      if (data.status) {
        updateData.status = (data.status as string).toUpperCase() as any;
      }

      return await prisma.leads.update({
        where: { id: Number(id) },
        data: updateData,
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
        where: { status: (status || '').toUpperCase() as unknown as Prisma.LeadStatus },
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
        where: { source: (source || '').toUpperCase() as unknown as Prisma.LeadSource },
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
        where: { status: (status || '').toUpperCase() as unknown as Prisma.LeadStatus },
      });
    } catch (error) {
      this.handleError(error, 'countByStatus');
    }
  }
}

export const leadRepository = new LeadRepository();
